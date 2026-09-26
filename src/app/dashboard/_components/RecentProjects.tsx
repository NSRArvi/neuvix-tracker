"use client";

import React from "react";
import { ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecentProjectsProps {
  projects: any[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const router = useRouter();
  
  // Sort by created_at desc and take top 5
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your most recently onboarded client contracts
          </p>
        </div>
        <Link 
          href="/dashboard/projects"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View all projects</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-6">Project & Client</th>
              <th className="py-3 px-6">Expected Delivery</th>
              <th className="py-3 px-6">Contract Value</th>
              <th className="py-3 px-6">Manager</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {recentProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              recentProjects.map((proj) => {
                const budgetStr = parseFloat(String(proj.budget || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 });
                
                return (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 block">{proj.name}</span>
                      <span className="text-[11px] text-slate-400">{proj.client_name || proj.client_email}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {proj.expected_delivery_date 
                        ? new Date(proj.expected_delivery_date).toLocaleDateString() 
                        : "Not Set"}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      ${budgetStr}
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                          {proj.manager?.name ? proj.manager.name.charAt(0) : '?'}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{proj.manager?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="View Project"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
