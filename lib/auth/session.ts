import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { User } from "@/lib/db";
import { connectDB } from "@/lib/db/connection";
import { isAdminTier, type UserRole } from "@/lib/auth/permissions";

const SESSION_NAME = "unipass_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret ? secret : null;
}

function sign(payload: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function readUserId(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  if (!expected) return null;

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId?: unknown };
    return typeof data.userId === "string" && data.userId ? data.userId : null;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(sessionData: SessionData): Promise<void> {
  const payload = Buffer.from(JSON.stringify({ userId: sessionData.userId })).toString("base64url");
  const signature = sign(payload);
  if (!signature) {
    throw new Error("SESSION_SECRET is not set");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_NAME);
  if (!sessionCookie?.value) return null;

  const userId = readUserId(sessionCookie.value);
  if (!userId) return null;

  await connectDB();
  const user = await User.findById(userId).select("email name role active");
  if (!user || !user.active) return null;

  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth();
  if (!isAdminTier(session.role)) {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

export async function authenticate(email: string, password: string): Promise<SessionData | null> {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase(), active: true });
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
