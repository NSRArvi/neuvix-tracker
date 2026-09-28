"use client";

import React from "react";
import { FolderKanban, Briefcase, Calendar, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface PlannerItem {
  id: string;
  project_id: string;
  project_name: string;
  expected_delivery_date?: string | null;
  services: string[];
  manager?: { name: string } | null;
  documents: { name: string; url: string }[];
  teams: { name: string; budget: string; members: string[] }[];
}

interface PlannerClientProps {
  planners: PlannerItem[];
  accessLevel?: "admin" | "manager" | "member" | string;
}

export function PlannerClient({ planners, accessLevel }: PlannerClientProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500 w-[200px]">Project Name</TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">Deadline</TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">Services</TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">Manager</TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100">
          {planners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center bg-white">
                <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-medium text-slate-900">No active planners</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new project to generate a planner overview.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            planners.map((planner) => (
              <TableRow key={planner.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <TableCell className="align-middle py-4">
                  <span className="text-sm font-bold text-slate-900 block">
                    <Link href={`/dashboard/planner/${planner.id}`} className="text-sm font-bold text-indigo-600 hover:underline">
                      {planner.project_name}
                    </Link>
                  </span>
                </TableCell>
                
                <TableCell className="align-middle py-4">
                  {planner.expected_delivery_date ? (
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(planner.expected_delivery_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>

                <TableCell className="align-middle py-4">
                  {planner.services && planner.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {planner.services.map((s, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          <Briefcase className="w-3 h-3 mr-1 opacity-50" /> {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>

                <TableCell className="align-middle py-4">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {planner.manager?.name ? planner.manager.name.charAt(0) : '?'}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{planner.manager?.name || 'Unassigned'}</span>
                  </div>
                </TableCell>

                <TableCell className="align-middle py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/dashboard/planner/${planner.id}`)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="View Project"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
