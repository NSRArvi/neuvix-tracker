import { createClient } from "@/lib/supabase/server";
import {
  CheckSquare,
  Users,
  FolderKanban,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default async function OverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "admin@neuvix.io";
  const userName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    userEmail.split("@")[0];

  // Monthly project onboarding data (Jan - Dec)
  const monthlyOnboardingData = [
    { month: "Jan", count: 4, height: "35%" },
    { month: "Feb", count: 6, height: "48%" },
    { month: "Mar", count: 5, height: "40%" },
    { month: "Apr", count: 8, height: "62%" },
    { month: "May", count: 11, height: "80%" },
    { month: "Jun", count: 9, height: "68%" },
    { month: "Jul", count: 12, height: "88%" },
    { month: "Aug", count: 10, height: "75%" },
    { month: "Sep", count: 14, height: "100%" },
    { month: "Oct", count: 9, height: "66%" },
    { month: "Nov", count: 11, height: "78%" },
    { month: "Dec", count: 7, height: "52%" },
  ];

  const recentProjects = [
    {
      name: "Apex Global Rebrand",
      client: "Apex Industries",
      tier: "Enterprise",
      value: "$64,000",
      paid: "$48,000",
      due: "$16,000",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      progress: 75,
    },
    {
      name: "Starlight SaaS Mobile App",
      client: "Starlight Tech",
      tier: "Growth",
      value: "$42,500",
      paid: "$42,500",
      due: "$0",
      status: "Completed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      progress: 100,
    },
    {
      name: "Krypton Design System",
      client: "Krypton Labs",
      tier: "Retainer",
      value: "$18,000",
      paid: "$9,000",
      due: "$9,000",
      status: "Under Review",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      progress: 50,
    },
    {
      name: "Vanguard E-Commerce Scale",
      client: "Vanguard Retail",
      tier: "Enterprise",
      value: "$124,000",
      paid: "$110,800",
      due: "$13,200",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      progress: 88,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700 mb-2">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Executive Agency Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your agency performance summary, projects, and pipeline overview.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-400">Timeframe:</span>
          <select className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs focus:outline-none">
            <option>This Year (2026)</option>
            <option>Last 6 Months</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* 1. TOP STATS: COUNTERS (Tasks, Teams, Projects, Planner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* My Tasks Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">24</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +4 today
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">18 completed • 6 pending review</p>
        </div>

        {/* Teams Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Teams
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">8</span>
            <span className="text-xs font-medium text-slate-500">Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">42 dedicated members assigned</p>
        </div>

        {/* Projects Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">18</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +3 this month
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">14 active • 4 in pipeline</p>
        </div>

        {/* Planner Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Planner Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">37</span>
            <span className="text-xs font-medium text-amber-600">Scheduled</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">5 deliverables due this week</p>
        </div>
      </div>

      {/* 2. FINANCIAL / VALUE METRICS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Onboarding projects according to months */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Onboarding by Month</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly volume of new client projects initiated
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span>Onboarded Projects</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-60 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {monthlyOnboardingData.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <div className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </div>
                <div
                  style={{ height: item.height }}
                  className="w-full max-w-[28px] rounded-t-lg bg-slate-100 group-hover:bg-indigo-600 transition-all duration-300 relative cursor-pointer"
                >
                  {item.month === "Sep" && (
                    <div className="absolute inset-0 bg-indigo-600 rounded-t-lg shadow-sm shadow-indigo-500/50" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          {/* Chart footer stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Onboarded</span>
              <span className="text-sm font-bold text-slate-800">107 Projects</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Peak Month</span>
              <span className="text-sm font-bold text-indigo-600">September (14)</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Avg Monthly Rate</span>
              <span className="text-sm font-bold text-slate-800">8.9 / mo</span>
            </div>
          </div>
        </div>

        {/* Financial Performance: Active Value, Paid, Due */}
        <div className="space-y-4">
          {/* Active Projects Value */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Projects Value
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">$248,500</div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Across 14 current client contracts</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full w-[85%] rounded-full" />
            </div>
          </div>

          {/* Paid Amount Count */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paid Amount
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">$210,300</div>
            <p className="text-xs text-slate-400 mt-1">84.6% collection rate this cycle</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[84.6%] rounded-full" />
            </div>
          </div>

          {/* Due Amount Count */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Due Amount
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600">$38,200</div>
            <p className="text-xs text-slate-400 mt-1">3 invoices pending client approval</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-rose-500 h-full w-[15.4%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVE PROJECTS OVERVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Projects</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time budget tracking, delivery progress & payment statuses
            </p>
          </div>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
            <span>View all projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Project & Client</th>
                <th className="py-3 px-6">Tier</th>
                <th className="py-3 px-6">Contract Value</th>
                <th className="py-3 px-6">Paid</th>
                <th className="py-3 px-6">Due</th>
                <th className="py-3 px-6">Progress</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentProjects.map((proj, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900 block">{proj.name}</span>
                    <span className="text-[11px] text-slate-400">{proj.client}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                      {proj.tier}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{proj.value}</td>
                  <td className="py-4 px-6 font-medium text-emerald-600">{proj.paid}</td>
                  <td className="py-4 px-6 font-medium text-rose-500">{proj.due}</td>
                  <td className="py-4 px-6 w-36">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${proj.progress}%` }}
                          className="bg-indigo-600 h-full rounded-full"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {proj.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${proj.statusColor}`}
                    >
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
