import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    // Check for duplicate email
    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    const user = await User.create({
      ...body,
      password: hashedPassword,
    });

    const { password, ...userResponse } = user.toObject();

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
