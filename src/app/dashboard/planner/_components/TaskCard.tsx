"use client";

import React from "react";
import { Edit2, Trash2, Calendar, Users, GripVertical, CheckSquare } from "lucide-react";

interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
}

interface Task {
  id: string;
  planner_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  status: string;
  assigned_team?: string | null;
  assigned_member?: string | null;
  priority: string;
  labels: string[];
  task_subtasks?: Subtask[];
}

interface TaskCardProps {
  task: Task;
  allMembers: { id: string; name: string }[];
  accessLevel: string;
  currentUserId?: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, title: string) => void;
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const PRIORITY_CONFIG: Record<string, { dot: string }> = {
  high: { dot: "bg-red-500" },
  medium: { dot: "bg-amber-400" },
  low: { dot: "bg-green-500" },
};

const LABEL_CONFIG: Record<string, string> = {
  Design: "bg-purple-100 text-purple-700",
  Development: "bg-blue-100 text-blue-700",
  Content: "bg-pink-100 text-pink-700",
  Bug: "bg-red-100 text-red-700",
  Urgent: "bg-orange-100 text-orange-700",
  Review: "bg-amber-100 text-amber-700",
  QA: "bg-teal-100 text-teal-700",
};

function getDueDateStatus(dateStr: string): "overdue" | "soon" | "normal" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 1) return "soon";
  return "normal";
}

const DUE_DATE_STYLES = {
  overdue: "text-red-600 bg-red-50",
  soon: "text-amber-600 bg-amber-50",
  normal: "text-slate-500 bg-transparent",
};

export function TaskCard({ task, allMembers, accessLevel, currentUserId, onEdit, onDelete, onClick, onDragStart }: TaskCardProps) {
  const memberName = task.assigned_member
    ? allMembers.find((m) => m.id === task.assigned_member)?.name
    : null;

  const canChangeStatus =
    accessLevel === "admin" ||
    accessLevel === "manager" ||
    (accessLevel === "member" && !!currentUserId && task.assigned_member === currentUserId);

  const subtasks = task.task_subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;

  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  return (
    <div
      draggable={canChangeStatus}
      onDragStart={(e) => {
        if (!canChangeStatus) {
          e.preventDefault();
          return;
        }
        onDragStart(e, task.id);
      }}
      onClick={() => onClick(task)}
      className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all group relative cursor-pointer ${
        canChangeStatus ? "active:cursor-grabbing" : ""
      }`}
    >
      {/* Top Row: Priority dot + Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={"w-2 h-2 rounded-full shrink-0 " + priorityCfg.dot} title={task.priority + " priority"} />
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className={"px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider " + (LABEL_CONFIG[label] || "bg-slate-100 text-slate-600")}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {accessLevel !== "member" && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id, task.title); }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-slate-800 text-sm mb-1 leading-snug">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Subtask Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckSquare className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: (completedSubtasks / totalSubtasks * 100) + "%" }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Team/Member + Due Date */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2">
          {task.assigned_team && (
            <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Users className="w-3 h-3" />
              <span className="max-w-[80px] truncate">{task.assigned_team}</span>
            </div>
          )}
          {memberName && (
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-white ring-1 ring-slate-100" title={memberName}>
              {memberName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {task.due_date && (() => {
          const status = getDueDateStatus(task.due_date);
          const style = DUE_DATE_STYLES[status];
          return (
            <div className={"flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded " + style}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}
              {status === "overdue" && <span className="text-[9px]">!</span>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

