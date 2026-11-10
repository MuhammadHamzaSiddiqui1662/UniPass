import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth/session";
import { canAssignRole } from "@/lib/auth/permissions";
import { authFailure } from "@/lib/auth/http";
import { createUserSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const parsed = createUserSchema.parse(await request.json());
    if (!canAssignRole(session.role, parsed.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const email = parsed.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const user = await User.create({
      email,
      name: parsed.name,
      role: parsed.role,
      active: parsed.active,
      password: await hashPassword(parsed.password),
    });

    const { password, ...userResponse } = user.toObject();
    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
