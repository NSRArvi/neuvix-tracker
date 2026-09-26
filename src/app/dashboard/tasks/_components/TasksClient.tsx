"use client";

import React, { useState } from "react";
import { CheckSquare, Calendar, Users, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { updateTaskStatus } from "../actions";
import { PageHeader } from "@/components/ui/page-header";

interface Task {
  id: string;
  planner_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  status: string;
  assigned_team?: string | null;
  planner?: {
    id: string;
    project_name: string;
  };
}

export function TasksClient({ initialTasks, accessLevel }: { initialTasks: any[]; accessLevel: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Group tasks by project
  const groupedTasks = tasks.reduce((acc, task) => {
    const projectName = task.planner?.project_name || "Unknown Project";
    if (!acc[projectName]) {
      acc[projectName] = {
        plannerId: task.planner_id,
        tasks: []
      };
    }
    acc[projectName].tasks.push(task);
    return acc;
  }, {} as Record<string, { plannerId: string, tasks: Task[] }>);

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
      // Revert on error
      setTasks(initialTasks);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <PageHeader 
        title="My Tasks"
        subtitle="Manage and update the progress of your assigned tasks."
      />

      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Tasks Assigned</h3>
          <p className="text-slate-500 mt-1">You do not have any active tasks across your projects.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([projectName, group]) => (
            <div key={projectName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                  {projectName}
                </h2>
                <Link 
                  href={`/dashboard/planner/${group.plannerId}`}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                >
                  View Planner <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.tasks.map(task => (
                    <div key={task.id} className="border border-slate-200 rounded-lg p-4 flex flex-col group hover:border-indigo-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-800 text-sm">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status === 'in_progress' ? 'IN PROGRESS' : task.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                      )}

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                        <div className="flex flex-col gap-1.5">
                          {task.assigned_team && (
                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                              <Users className="w-3 h-3" /> {task.assigned_team}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 
                              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                            </span>
                          )}
                        </div>

                        <select 
                          className="text-xs font-semibold border-slate-200 rounded-md py-1.5 pl-2 pr-6 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-0 focus:border-indigo-400 cursor-pointer"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

