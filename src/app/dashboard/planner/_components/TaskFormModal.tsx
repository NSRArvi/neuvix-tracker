"use client";

import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPlannerTask, updatePlannerTask } from "../actions";

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
  task_subtasks?: any[];
}

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  plannerId: string;
  teams: { name: string; members: string[] }[];
  allMembers: { id: string; name: string }[];
}

const LABEL_OPTIONS = [
  { name: "Design", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Development", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Content", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Bug", color: "bg-red-100 text-red-700 border-red-200" },
  { name: "Urgent", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Review", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { name: "QA", color: "bg-teal-100 text-teal-700 border-teal-200" },
];

export function TaskFormModal({
  open,
  onOpenChange,
  editingTask,
  plannerId,
  teams,
  allMembers,
}: TaskFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [priority, setPriority] = useState(editingTask?.priority || "medium");
  const [dueDate, setDueDate] = useState(editingTask?.due_date ? editingTask.due_date.split("T")[0] : "");
  const [assignedTeam, setAssignedTeam] = useState(editingTask?.assigned_team || "");
  const [assignedMember, setAssignedMember] = useState(editingTask?.assigned_member || "");
  const [selectedLabels, setSelectedLabels] = useState<string[]>(editingTask?.labels || []);

  // Reset form when modal opens/closes or editingTask changes
  React.useEffect(() => {
    if (open) {
      setTitle(editingTask?.title || "");
      setDescription(editingTask?.description || "");
      setPriority(editingTask?.priority || "medium");
      setDueDate(editingTask?.due_date ? editingTask.due_date.split("T")[0] : "");
      setAssignedTeam(editingTask?.assigned_team || "");
      setAssignedMember(editingTask?.assigned_member || "");
      setSelectedLabels(editingTask?.labels || []);
      setError(null);
    }
  }, [open, editingTask]);

  // Get members filtered by selected team
  const filteredMembers = React.useMemo(() => {
    if (!assignedTeam) return allMembers;
    const team = teams.find((t) => t.name === assignedTeam);
    if (!team || !team.members) return allMembers;
    return allMembers.filter((m) => team.members.includes(m.id));
  }, [assignedTeam, teams, allMembers]);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        assigned_team: assignedTeam || null,
        assigned_member: assignedMember || null,
        priority,
        labels: selectedLabels,
      };

      if (editingTask) {
        await updatePlannerTask(plannerId, editingTask.id, payload);
      } else {
        await createPlannerTask(plannerId, payload);
      }

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design Homepage Wireframes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              placeholder="Add more details here..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Priority</label>
            <div className="flex gap-2">
              {[
                { value: "high", label: "High", dot: "bg-red-500", ring: "ring-red-200" },
                { value: "medium", label: "Medium", dot: "bg-amber-400", ring: "ring-amber-200" },
                { value: "low", label: "Low", dot: "bg-green-500", ring: "ring-green-200" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all " +
                    (priority === p.value
                      ? "border-slate-300 bg-slate-50 ring-2 " + p.ring
                      : "border-slate-200 text-slate-500 hover:border-slate-300")
                  }
                >
                  <span className={"w-2 h-2 rounded-full " + p.dot} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date + Team (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assign Team</label>
              <select
                value={assignedTeam}
                onChange={(e) => {
                  setAssignedTeam(e.target.value);
                  setAssignedMember(""); // Reset member when team changes
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {teams.filter((t) => t.name).map((t, idx) => (
                  <option key={idx} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign Member */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Assign Member
              {assignedTeam && (
                <span className="text-slate-400 font-normal ml-1">
                  (from {assignedTeam})
                </span>
              )}
            </label>
            <select
              value={assignedMember}
              onChange={(e) => setAssignedMember(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {filteredMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Labels</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => {
                const isSelected = selectedLabels.includes(label.name);
                return (
                  <button
                    key={label.name}
                    type="button"
                    onClick={() => toggleLabel(label.name)}
                    className={
                      "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border transition-all " +
                      (isSelected
                        ? label.color + " ring-1 ring-offset-1"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300")
                    }
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

