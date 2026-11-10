import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function authFailure(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "";
  if (message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message.startsWith("Forbidden")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
