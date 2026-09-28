"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Send,
  CheckSquare,
  Square,
  X,
  Calendar,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  getTaskComments,
  createTaskComment,
} from "../actions";

interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
}

interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  author: { id: string; name: string };
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

interface TaskDetailPanelProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plannerId: string;
  allMembers: { id: string; name: string }[];
  currentUserId: string;
  accessLevel: string;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const PRIORITY_LABELS: Record<string, { label: string; style: string }> = {
  high: { label: "High", style: "bg-red-100 text-red-700" },
  medium: { label: "Medium", style: "bg-amber-100 text-amber-700" },
  low: { label: "Low", style: "bg-green-100 text-green-700" },
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

export function TaskDetailPanel({
  task,
  open,
  onOpenChange,
  plannerId,
  allMembers,
  currentUserId,
  accessLevel,
  onStatusChange,
}: TaskDetailPanelProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Load subtasks from task prop and fetch comments when task changes
  useEffect(() => {
    if (task && open) {
      setSubtasks(task.task_subtasks || []);
      loadComments(task.id);
    }
  }, [task?.id, open]);

  const loadComments = async (taskId: string) => {
    setIsLoadingComments(true);
    try {
      const data = await getTaskComments(taskId);
      setComments(data as Comment[]);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // ─── Subtask Handlers ──────────────────────────────────

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    setIsAddingSubtask(true);
    try {
      const created = await createSubtask(plannerId, task.id, newSubtaskTitle.trim());
      setSubtasks((prev) => [...prev, created]);
      setNewSubtaskTitle("");
    } catch (err: any) {
      console.error("Failed to add subtask:", err);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, current: boolean) => {
    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, is_completed: !current } : s))
    );
    try {
      await toggleSubtask(plannerId, subtaskId, !current);
    } catch (err: any) {
      // Revert
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, is_completed: current } : s))
      );
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const prev = subtasks;
    setSubtasks((s) => s.filter((st) => st.id !== subtaskId));
    try {
      await deleteSubtask(plannerId, subtaskId);
    } catch (err: any) {
      setSubtasks(prev);
    }
  };

  // ─── Comment Handlers ──────────────────────────────────

  const handleAddComment = async () => {
    if (!newComment.trim() || !task || !currentUserId) return;
    setIsSendingComment(true);
    try {
      const created = await createTaskComment(plannerId, task.id, currentUserId, newComment.trim());
      setComments((prev) => [...prev, created as Comment]);
      setNewComment("");
    } catch (err: any) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSendingComment(false);
    }
  };

  if (!task) return null;

  const canChangeStatus =
    accessLevel === "admin" ||
    accessLevel === "manager" ||
    (accessLevel === "member" && !!currentUserId && task.assigned_member === currentUserId);

  const memberName = task.assigned_member
    ? allMembers.find((m) => m.id === task.assigned_member)?.name
    : null;

  const priorityCfg = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium;

  const completedCount = subtasks.filter((s) => s.is_completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 leading-snug pr-8">
              {task.title}
            </DialogTitle>
          </DialogHeader>

          {/* Meta Row: Priority, Labels, Status Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + priorityCfg.style}>
                {priorityCfg.label}
              </span>
              {task.labels?.map((label) => (
                <span
                  key={label}
                  className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider " + (LABEL_CONFIG[label] || "bg-slate-100 text-slate-600")}
                >
                  {label}
                </span>
              ))}
            </div>

            {onStatusChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">Status:</span>
                {canChangeStatus ? (
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className="text-xs font-semibold border border-slate-200 rounded-md py-1 pl-2 pr-6 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 capitalize">
                    {task.status.replace("_", " ")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {task.assigned_team && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{task.assigned_team}</span>
              </div>
            )}
            {memberName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center">
                  {memberName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{memberName}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
          {/* ─── Subtasks / Checklist ─── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                Subtasks
                {subtasks.length > 0 && (
                  <span className="text-xs font-normal text-slate-400">
                    ({completedCount}/{subtasks.length})
                  </span>
                )}
              </h3>
            </div>

            {/* Subtask Progress */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: (completedCount / subtasks.length * 100) + "%" }}
                />
              </div>
            )}

            {/* Subtask List */}
            <div className="space-y-1">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 group py-1">
                  <button
                    onClick={() => handleToggleSubtask(st.id, st.is_completed)}
                    className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {st.is_completed ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={
                      "text-sm flex-1 " +
                      (st.is_completed ? "text-slate-400 line-through" : "text-slate-700")
                    }
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); }}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Comments / Activity ─── */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Comments
              {comments.length > 0 && (
                <span className="text-xs font-normal text-slate-400">({comments.length})</span>
              )}
            </h3>

            {isLoadingComments ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {comment.author?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-800">{comment.author?.name || "Unknown"}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.created_at).toLocaleString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">No comments yet.</p>
                )}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSendingComment}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md disabled:opacity-50 transition-colors"
              >
                {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
