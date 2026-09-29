import React from "react";

export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-128px)] w-full flex border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white animate-pulse">
      {/* Sidebar List Skeleton */}
      <div className="w-80 border-r border-slate-200 p-4 space-y-4 bg-slate-50/50">
        <div className="h-9 bg-slate-200 rounded-lg"></div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-24"></div>
                <div className="h-2.5 bg-slate-200/60 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Skeleton */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div className="h-12 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>

        <div className="space-y-4 py-8">
          <div className="h-10 bg-slate-100 rounded-xl w-64"></div>
          <div className="h-12 bg-indigo-50 rounded-xl w-72 ml-auto"></div>
          <div className="h-8 bg-slate-100 rounded-xl w-48"></div>
        </div>

        <div className="h-11 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
}
