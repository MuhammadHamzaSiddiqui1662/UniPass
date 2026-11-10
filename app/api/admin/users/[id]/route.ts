import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth/session";
import {
  canChangeUserRole,
  canDeleteUser,
  canEditUser,
  canSetActive,
  type UserRole,
} from "@/lib/auth/permissions";
import { authFailure } from "@/lib/auth/http";
import { updateUserSchema } from "@/lib/validations/schemas";

function actorFrom(session: { userId: string; role: UserRole }) {
  return { id: session.userId, role: session.role };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const { id } = await params;
    const parsed = updateUserSchema.parse(await request.json());
    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actor = actorFrom(session);
    const targetActor = { id: target._id.toString(), role: target.role };
    if (!canEditUser(actor, targetActor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.role && !canChangeUserRole(actor, targetActor, parsed.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.active !== undefined && !canSetActive(actor, targetActor, parsed.active)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.email) {
      const email = parsed.email.toLowerCase();
      const existing = await User.findOne({ email, _id: { $ne: target._id } });
      if (existing) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
      target.email = email;
    }

    if (parsed.name) target.name = parsed.name;
    if (parsed.role) target.role = parsed.role;
    if (parsed.active !== undefined) target.active = parsed.active;
    if (parsed.password) target.password = await hashPassword(parsed.password);

    await target.save();
    const user = target.toObject();
    delete (user as { password?: string }).password;

    return NextResponse.json({ user });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const { id } = await params;
    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canDeleteUser(actorFrom(session), { id: target._id.toString(), role: target.role })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await target.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
