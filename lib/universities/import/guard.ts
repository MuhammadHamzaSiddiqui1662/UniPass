import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";

export async function ensureAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.startsWith("Forbidden") ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }
}
