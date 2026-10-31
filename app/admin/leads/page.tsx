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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-display text-xl text-primary-900">
                UniPass Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/admin" className="text-slate-600 hover:text-primary-900">
                  Dashboard
                </Link>
                <Link
                  href="/admin/leads"
                  className="text-primary font-bold border-b-2 border-primary pb-1"
                >
                  Leads
                </Link>
                <Link
                  href="/admin/universities"
                  className="text-slate-600 hover:text-primary-900"
                >
                  Universities
                </Link>
                <Link href="/admin/guides" className="text-slate-600 hover:text-primary-900">
                  Guides
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-slate-600 hover:text-primary-900"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{session.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-slate-600 hover:text-primary-900"
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

        <div className="bg-white rounded-card border border-slate-200 p-6 mb-6">
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

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary-900">
                        {lead.fullName}
                      </div>
                      {lead.university && (
                        <div className="text-xs text-slate-600">
                          Interest: {lead.university.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">
                        {formatPhoneNumber(lead.whatsappNumber)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">{lead.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">{lead.levelOfStudy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`chip ${
                          lead.status === "new"
                            ? "bg-info-tint text-primary-800"
                            : lead.status === "contacted"
                            ? "bg-warning-tint text-secondary-800"
                            : lead.status === "qualified"
                            ? "bg-success-tint text-primary-800"
                            : lead.status === "applied"
                            ? "bg-primary-100 text-primary-800"
                            : lead.status === "enrolled"
                            ? "bg-success-tint text-primary-800"
                            : "bg-error-tint text-primary-900"
                        }`}
                      >
                        {LEAD_STATUSES.find((s) => s.value === lead.status)
                          ?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="text-primary hover:underline"
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
            <div className="border-t border-slate-200 px-6 py-4 flex justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={{
                    query: { ...searchParams, page: currentPage - 1 },
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-input text-sm hover:bg-primary-50"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={{
                    query: { ...searchParams, page: currentPage + 1 },
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-input text-sm hover:bg-primary-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}

          {leads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No leads found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
