import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-slate-200/70 rounded-lg w-64"></div>
      <div className="h-4 bg-slate-200/50 rounded w-96"></div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200/60 p-6">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200/60 p-6"></div>
    </div>
  );
}
