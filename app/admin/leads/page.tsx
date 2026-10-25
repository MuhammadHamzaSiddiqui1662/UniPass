import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Lead, User } from "@/lib/db";
import Link from "next/link";
import { formatDate, formatPhoneNumber } from "@/lib/utils/format";
import { LEAD_STATUSES } from "@/lib/utils/constants";

interface SearchParams {
  search?: string;
  status?: string;
  assignedTo?: string;
  page?: string;
}

async function getLeads(searchParams: SearchParams) {
  try {
    await connectDB();

    const query: any = {};
    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    if (searchParams.search) {
      query.$or = [
        { fullName: { $regex: searchParams.search, $options: "i" } },
        { whatsappNumber: { $regex: searchParams.search, $options: "i" } },
        { city: { $regex: searchParams.search, $options: "i" } },
      ];
    }

    if (searchParams.status) {
      query.status = searchParams.status;
    }

    if (searchParams.assignedTo) {
      query.assignedTo = searchParams.assignedTo;
    }

    const [leads, total, users] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo", "name")
        .populate("university", "name")
        .lean(),
      Lead.countDocuments(query),
      User.find({ active: true }).select("_id name").lean(),
    ]);

    return {
      leads: JSON.parse(JSON.stringify(leads)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      users: JSON.parse(JSON.stringify(users)),
    };
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return {
      leads: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      users: [],
    };
  }
}

export default async function LeadsPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const searchParams = await rawSearchParams;
  const { leads, total, currentPage, totalPages, users } =
    await getLeads(searchParams);

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
                <Link
                  href="/admin/settings"
                  className="text-body hover:text-ink"
                >
                  Settings
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Leads ({total})</h1>
          <Link
            href="/admin/leads/export"
            className="btn-outline text-sm px-4 py-2"
          >
            Export CSV
          </Link>
        </div>

        <div className="bg-white rounded-card border border-border p-6 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search name, phone, city..."
              defaultValue={searchParams.search}
              className="input-field"
            />
            <select name="status" defaultValue={searchParams.status || ""} className="input-field">
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              name="assignedTo"
              defaultValue={searchParams.assignedTo || ""}
              className="input-field"
            >
              <option value="">All staff</option>
              {users.map((user: any) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary">
              Filter
            </button>
          </form>
        </div>

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-tint">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-surface-tint/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-ink">
                        {lead.fullName}
                      </div>
                      {lead.university && (
                        <div className="text-xs text-body">
                          Interest: {lead.university.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-ink">
                        {formatPhoneNumber(lead.whatsappNumber)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-ink">{lead.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-ink">{lead.levelOfStudy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`chip ${
                          lead.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : lead.status === "contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "qualified"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "applied"
                            ? "bg-purple-100 text-purple-700"
                            : lead.status === "enrolled"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {LEAD_STATUSES.find((s) => s.value === lead.status)
                          ?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="text-navy hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={{
                    query: { ...searchParams, page: currentPage - 1 },
                  }}
                  className="px-4 py-2 border border-border rounded-input text-sm hover:bg-surface-tint"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-body">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={{
                    query: { ...searchParams, page: currentPage + 1 },
                  }}
                  className="px-4 py-2 border border-border rounded-input text-sm hover:bg-surface-tint"
                >
                  Next
                </Link>
              )}
            </div>
          )}

          {leads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body">No leads found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
