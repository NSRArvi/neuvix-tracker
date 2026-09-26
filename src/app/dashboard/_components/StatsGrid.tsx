import React from "react";
import { CheckSquare, Users, FolderKanban, CalendarDays } from "lucide-react";

interface StatsGridProps {
  tasksCount: number;
  membersCount: number;
  projectsCount: number;
  plannersCount: number;
}

export function StatsGrid({ tasksCount, membersCount, projectsCount, plannersCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* My Tasks Count */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            My Tasks
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{tasksCount}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Active tasks assigned</p>
        </div>
      </div>

      {/* Members Count */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Team Members
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{membersCount}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Total registered members</p>
        </div>
      </div>

      {/* Projects Count */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Projects
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{projectsCount}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Active projects across agency</p>
        </div>
      </div>

      {/* Planner Count */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Planner Items
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{plannersCount}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Total synced planners</p>
        </div>
      </div>
    </div>
  );
}
