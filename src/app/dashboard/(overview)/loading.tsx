import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs h-32 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs h-[122px]">
              <div className="flex justify-between mb-3">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-7 w-7 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    </div>
  );
}
