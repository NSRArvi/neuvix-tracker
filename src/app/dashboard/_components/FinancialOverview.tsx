import React from "react";
import { TrendingUp, DollarSign, Briefcase } from "lucide-react";

interface FinancialOverviewProps {
  projects: any[];
}

export function FinancialOverview({ projects }: FinancialOverviewProps) {
  // 1. Calculate Total Pipeline Value, Collections, and Pendings
  let totalBudget = 0;
  let totalCollections = 0;

  projects.forEach((p) => {
    const projBudget = parseFloat(String(p.budget || 0));
    const validProjBudget = isNaN(projBudget) ? 0 : projBudget;
    totalBudget += validProjBudget;

    const milestones = p.milestones || [];

    milestones.forEach((m: any) => {
      const percent = parseFloat(String(m.payment_percent || 0));
      const validPercent = isNaN(percent) ? 0 : percent;
      
      const milestoneAmount = validProjBudget * (validPercent / 100);
      
      if (m.status === "completed") {
         totalCollections += milestoneAmount;
      }
    });
  });

  const totalPendings = totalBudget - totalCollections;

  const activeProjectsCount = projects.length;

  // 2. Calculate Monthly Onboarding Data for the current year
  const currentYear = new Date().getFullYear();
  const monthlyCounts = new Array(12).fill(0);

  projects.forEach((p) => {
    if (p.created_at) {
      const date = new Date(p.created_at);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()] += 1;
      }
    }
  });

  const maxCount = Math.max(...monthlyCounts, 1); // Avoid division by zero
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyOnboardingData = months.map((month, idx) => {
    const count = monthlyCounts[idx];
    // Height percentage relative to the max count, with a minimum of 5% so it's visible
    const height = count === 0 ? "5%" : `${Math.max((count / maxCount) * 100, 5)}%`;
    return { month, count, height };
  });

  const peakMonthValue = Math.max(...monthlyCounts);
  const peakMonthIndex = monthlyCounts.indexOf(peakMonthValue);
  const peakMonthName = peakMonthValue > 0 ? months[peakMonthIndex] : "None";
  
  const avgMonthlyRate = (projects.length / 12).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart: Onboarding projects according to months */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Project Onboarding ({currentYear})</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly volume of new client projects initiated this year
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
                {item.count > 0 ? item.count : ""}
              </div>
              <div
                style={{ height: item.height }}
                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative cursor-pointer ${
                  item.count > 0 ? "bg-slate-200 group-hover:bg-indigo-600" : "bg-slate-50"
                }`}
              >
                {item.count === peakMonthValue && peakMonthValue > 0 && (
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
            <span className="text-sm font-bold text-slate-800">{projects.length} Projects</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Peak Month</span>
            <span className="text-sm font-bold text-indigo-600">
              {peakMonthName} ({peakMonthValue})
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Avg Monthly Rate</span>
            <span className="text-sm font-bold text-slate-800">{avgMonthlyRate} / mo</span>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="space-y-4 flex flex-col justify-between">
        {/* Total Pipeline Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {activeProjectsCount} current client contracts</span>
          </div>
        </div>

        {/* Total Collections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Collections
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            ${totalCollections.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">From completed milestones</p>
        </div>

        {/* Total Pendings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Pendings
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            ${totalPendings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">From pending pipeline</p>
        </div>
      </div>
    </div>
  );
}
