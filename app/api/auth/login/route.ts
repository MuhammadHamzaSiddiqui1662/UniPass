import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { authenticate, createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    await connectDB();
    const sessionData = await authenticate(email, password);

    if (!sessionData) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(sessionData);

    return NextResponse.json({
      success: true,
      user: {
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
