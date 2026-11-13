import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { connectDB, Lead, User } from "@/lib/db";
import Link from "next/link";
import { formatDate, formatPhoneNumber, generateWhatsAppLink } from "@/lib/utils/format";
import LeadDetailClient from "@/components/admin/LeadDetailClient";
import AdminNav from "@/components/admin/AdminNav";
import {
  canAccessLead,
  canAssignLeads,
  canDeleteLead,
  canDownloadLeadDocument,
  canExportLead,
} from "@/lib/auth/permissions";
import { presentLead } from "@/lib/leads/document";

async function getLeadDetail(id: string, userId: string, role: "super_admin" | "admin" | "supervisor" | "staff") {
  try {
    await connectDB();

    const lead = await Lead.findById(id)
      .populate("assignedTo", "name email role")
      .populate("university", "name")
      .populate("activity.user", "name")
      .populate("document.uploadedBy", "name")
      .lean();

    if (!lead || !canAccessLead(role, userId, lead.assignedTo)) {
      return null;
    }

    const users: { _id: string; name: string }[] = canAssignLeads(role)
      ? (await User.find({ role: "staff", active: true }).select("_id name").lean()).map((user) => ({
          _id: String(user._id),
          name: user.name,
        }))
      : [];

    const assigned = lead.assignedTo as { _id?: unknown; name?: string } | null | undefined;
    if (assigned?._id && !users.some((user) => user._id === String(assigned._id))) {
      users.unshift({ _id: String(assigned._id), name: assigned.name || "Assigned user" });
    }

    return {
      lead: JSON.parse(JSON.stringify(presentLead(lead))),
      users: JSON.parse(JSON.stringify(users)),
      canDelete: canDeleteLead(role),
      canAssign: canAssignLeads(role),
      canExport: canExportLead(role),
      canDownload: canDownloadLeadDocument(role),
    };
  } catch (error) {
    console.error("Failed to fetch lead:", error);
    return null;
  }
}

export default async function LeadDetailPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await rawParams;
  const data = await getLeadDetail(params.id, session.userId, session.role);
  if (!data) notFound();

  const { lead, users, canDelete, canAssign, canExport, canDownload } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="leads" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/leads"
            className="text-primary hover:underline text-sm"
          >
            ← Back to leads
          </Link>
          {canExport && (
            <a href={`/admin/leads/${lead._id}/export`} className="btn-outline text-sm px-4 py-2">
              Export this lead
            </a>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-card border border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                Lead ID
              </p>
              <p className="font-mono text-lg text-primary-900 mb-4">{lead.trackingId}</p>
              <h1 className="font-display text-2xl mb-6">{lead.fullName}</h1>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-bold text-slate-600 mb-1">
                    WhatsApp
                  </dt>
                  <dd className="text-primary-900">
                    <a
                      href={generateWhatsAppLink(lead.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-whatsapp hover:underline"
                    >
                      {formatPhoneNumber(lead.whatsappNumber)}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-slate-600 mb-1">City</dt>
                  <dd className="text-primary-900">{lead.city}</dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-slate-600 mb-1">
                    Level of Study
                  </dt>
                  <dd className="text-primary-900">{lead.levelOfStudy}</dd>
                </div>

                {lead.bestTimeToReach && (
                  <div>
                    <dt className="text-sm font-bold text-slate-600 mb-1">
                      Best Time to Reach
                    </dt>
                    <dd className="text-primary-900">{lead.bestTimeToReach}</dd>
                  </div>
                )}

                {lead.university && (
                  <div>
                    <dt className="text-sm font-bold text-slate-600 mb-1">
                      University Interest
                    </dt>
                    <dd className="text-primary-900">{lead.university.name}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-bold text-slate-600 mb-1">Source</dt>
                  <dd className="text-primary-900">
                    {lead.source}
                    <br />
                    <span className="text-sm text-slate-600">{lead.sourcePage}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-slate-600 mb-1">
                    Submitted
                  </dt>
                  <dd className="text-primary-900">{formatDate(lead.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-2">
            <LeadDetailClient
              lead={lead}
              users={users}
              canDelete={canDelete}
              canAssign={canAssign}
              canDownload={canDownload}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
