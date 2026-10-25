import { getSession, requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Lead, User } from "@/lib/db";
import Link from "next/link";
import { formatDate, formatPhoneNumber, generateWhatsAppLink } from "@/lib/utils/format";
import LeadDetailClient from "@/components/admin/LeadDetailClient";

async function getLeadDetail(id: string, userId: string, isAdmin: boolean) {
  try {
    await connectDB();

    const lead = await Lead.findById(id)
      .populate("assignedTo", "name")
      .populate("university", "name")
      .populate("activity.user", "name")
      .lean();

    if (!lead) {
      return null;
    }

    const users = await User.find({ active: true }).select("_id name").lean();

    return {
      lead: JSON.parse(JSON.stringify(lead)),
      users: JSON.parse(JSON.stringify(users)),
      canDelete: isAdmin,
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
  const session = await requireAuth();
  const params = await rawParams;

  const data = await getLeadDetail(
    params.id,
    session.userId,
    session.role === "admin"
  );

  if (!data) {
    redirect("/admin/leads");
  }

  const { lead, users, canDelete } = data;

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-display text-xl text-ink">
                UniPass Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/admin" className="text-body hover:text-ink">
                  Dashboard
                </Link>
                <Link
                  href="/admin/leads"
                  className="text-navy font-bold border-b-2 border-navy pb-1"
                >
                  Leads
                </Link>
                <Link
                  href="/admin/universities"
                  className="text-body hover:text-ink"
                >
                  Universities
                </Link>
                <Link href="/admin/guides" className="text-body hover:text-ink">
                  Guides
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-body">{session.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-body hover:text-ink"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/leads"
            className="text-navy hover:underline text-sm"
          >
            ← Back to leads
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-card border border-border p-6">
              <h1 className="font-display text-2xl mb-6">{lead.fullName}</h1>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-bold text-body mb-1">
                    WhatsApp
                  </dt>
                  <dd className="text-ink">
                    <a
                      href={generateWhatsAppLink(lead.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-whatsapp-green hover:underline"
                    >
                      {formatPhoneNumber(lead.whatsappNumber)}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-body mb-1">City</dt>
                  <dd className="text-ink">{lead.city}</dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-body mb-1">
                    Level of Study
                  </dt>
                  <dd className="text-ink">{lead.levelOfStudy}</dd>
                </div>

                {lead.bestTimeToReach && (
                  <div>
                    <dt className="text-sm font-bold text-body mb-1">
                      Best Time to Reach
                    </dt>
                    <dd className="text-ink">{lead.bestTimeToReach}</dd>
                  </div>
                )}

                {lead.university && (
                  <div>
                    <dt className="text-sm font-bold text-body mb-1">
                      University Interest
                    </dt>
                    <dd className="text-ink">{lead.university.name}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-bold text-body mb-1">Source</dt>
                  <dd className="text-ink">
                    {lead.source}
                    <br />
                    <span className="text-sm text-body">{lead.sourcePage}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-bold text-body mb-1">
                    Submitted
                  </dt>
                  <dd className="text-ink">{formatDate(lead.createdAt)}</dd>
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
