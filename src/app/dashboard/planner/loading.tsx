import React from "react";

export default function PlannerLoading() {
  return (
    <div className="max-w-7xl mx-auto pb-12 animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-200/60 rounded w-72"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4 space-y-4">
        <div className="h-10 bg-slate-100 rounded"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-slate-50 rounded border border-slate-100"></div>
        ))}
      </div>
    </div>
  );
}
