import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB, Lead, User } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { authFailure } from "@/lib/auth/http";
import {
  canAccessLead,
  canAssignLeads,
  canDeleteLead,
} from "@/lib/auth/permissions";
import { deleteStoredLeadPdf, presentLead } from "@/lib/leads/document";
import { updateLeadSchema } from "@/lib/validations/schemas";

function loadLead(id: string) {
  return Lead.findById(id)
    .populate("assignedTo", "name")
    .populate("university", "name")
    .populate("activity.user", "name")
    .populate("document.uploadedBy", "name");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id } = await params;
    const lead = await loadLead(id).lean();
    if (!lead || !canAccessLead(session.role, session.userId, lead.assignedTo)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead: presentLead(lead) });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Get lead error:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id } = await params;
    const validatedData = updateLeadSchema.parse(await request.json());
    const existing = await Lead.findById(id);
    if (!existing || !canAccessLead(session.role, session.userId, existing.assignedTo)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const $set: Record<string, unknown> = {};
    const activity: { action: string; note?: string; user: string; timestamp: Date }[] = [];

    if (validatedData.status) $set.status = validatedData.status;
    if (validatedData.notes !== undefined) $set.notes = validatedData.notes;

    if (validatedData.assignedTo !== undefined) {
      if (!canAssignLeads(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (validatedData.assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(validatedData.assignedTo)) {
          return NextResponse.json(
            { error: "Leads can only be assigned to active staff" },
            { status: 400 }
          );
        }
        const assignee = await User.findOne({
          _id: validatedData.assignedTo,
          role: "staff",
          active: true,
        });
        if (!assignee) {
          return NextResponse.json(
            { error: "Leads can only be assigned to active staff" },
            { status: 400 }
          );
        }
        $set.assignedTo = assignee._id;
        if (String(existing.assignedTo || "") !== String(assignee._id)) {
          activity.push({
            action: `Assigned to ${assignee.name}`,
            user: session.userId,
            timestamp: new Date(),
          });
        }
      } else {
        $set.assignedTo = null;
        if (existing.assignedTo) {
          activity.push({
            action: "Assignment cleared",
            user: session.userId,
            timestamp: new Date(),
          });
        }
      }
    }

    if (validatedData.addActivity) {
      activity.push({
        action: validatedData.addActivity.action,
        note: validatedData.addActivity.note,
        user: session.userId,
        timestamp: new Date(),
      });
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (activity.length) update.$push = { activity: { $each: activity } };

    const lead = Object.keys(update).length
      ? await Lead.findByIdAndUpdate(id, update, { new: true, runValidators: true })
          .populate("assignedTo", "name")
          .populate("university", "name")
          .populate("activity.user", "name")
          .lean()
      : await loadLead(id).lean();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead: presentLead(lead) });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!canDeleteLead(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await deleteStoredLeadPdf(lead.document).catch((error) => {
      console.warn("Lead document delete skipped:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
