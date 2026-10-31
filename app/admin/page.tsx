import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Lead } from "@/lib/db";

async function getDashboardData() {
  try {
    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      recentLeads,
      statusCounts,
    ] = await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
      Lead.countDocuments({ createdAt: { $gte: monthAgo } }),
      Lead.countDocuments(),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("fullName whatsappNumber city levelOfStudy status createdAt")
        .lean(),
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const statusMap = Object.fromEntries(
      statusCounts.map((s) => [s._id, s.count])
    );

    return {
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      recentLeads: JSON.parse(JSON.stringify(recentLeads)),
      statusCounts: statusMap,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      totalCount: 0,
      recentLeads: [],
      statusCounts: {},
    };
  }
}

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="font-display text-xl text-primary-900">
                UniPass Admin
              </h1>
              <div className="hidden md:flex gap-6">
                <a
                  href="/admin"
                  className="text-primary font-bold border-b-2 border-primary pb-1"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/leads"
                  className="text-slate-600 hover:text-primary-900"
                >
                  Leads
                </a>
                <a
                  href="/admin/universities"
                  className="text-slate-600 hover:text-primary-900"
                >
                  Universities
                </a>
                <a href="/admin/guides" className="text-slate-600 hover:text-primary-900">
                  Guides
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{session.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-sm text-slate-600 hover:text-primary-900">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-display mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today", value: data.todayCount, color: "blue" },
            { label: "This Week", value: data.weekCount, color: "green" },
            { label: "This Month", value: data.monthCount, color: "purple" },
            { label: "Total Leads", value: data.totalCount, color: "primary" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-card border border-slate-200"
            >
              <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-display text-primary-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-card border border-slate-200">
            <h3 className="font-display text-xl mb-4">Recent Leads</h3>
            <div className="space-y-4">
              {data.recentLeads.map((lead: any) => (
                <div
                  key={lead._id}
                  className="border-b border-slate-200 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-primary-900">{lead.fullName}</p>
                      <p className="text-sm text-slate-600">
                        {lead.whatsappNumber} • {lead.city}
                      </p>
                    </div>
                    <span
                      className={`chip ${
                        lead.status === "new"
                          ? "bg-info-tint text-primary-800"
                          : lead.status === "contacted"
                          ? "bg-warning-tint text-secondary-800"
                          : "bg-success-tint text-primary-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{lead.levelOfStudy}</p>
                </div>
              ))}
            </div>
            <a
              href="/admin/leads"
              className="block mt-4 text-center btn-outline"
            >
              View all leads
            </a>
          </div>

          <div className="bg-white p-6 rounded-card border border-slate-200">
            <h3 className="font-display text-xl mb-4">Leads by Status</h3>
            <div className="space-y-3">
              {[
                { status: "new", label: "New" },
                { status: "contacted", label: "Contacted" },
                { status: "qualified", label: "Qualified" },
                { status: "applied", label: "Applied" },
                { status: "enrolled", label: "Enrolled" },
                { status: "lost", label: "Lost" },
              ].map((item) => (
                <div
                  key={item.status}
                  className="flex justify-between items-center"
                >
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-primary-900">
                    {data.statusCounts[item.status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
