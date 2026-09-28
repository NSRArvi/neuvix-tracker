"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { TaskCard } from "./TaskCard";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { updatePlannerTaskStatus, deletePlannerTask } from "../actions";

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

interface PlannerTasksKanbanProps {
  plannerId: string;
  tasks: Task[];
  teams: { name: string; members: string[] }[];
  allMembers: { id: string; name: string }[];
  accessLevel: string;
  currentUserId: string;
}

const COLUMNS = [
  { id: "pending", label: "Pending", color: "bg-yellow-50", accent: "border-yellow-100" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-50", accent: "border-blue-200" },
  { id: "completed", label: "Completed", color: "bg-emerald-50", accent: "border-emerald-200" },
];

export function PlannerTasksKanban({
  plannerId,
  tasks,
  teams,
  allMembers,
  accessLevel,
  currentUserId,
}: PlannerTasksKanbanProps) {
  // Optimistic UI state
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks || []);
  React.useEffect(() => { setOptimisticTasks(tasks || []); }, [tasks]);

  // Form Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Detail Panel
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: "", taskTitle: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag state
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // ─── Handlers ──────────────────────────────────────────

  const openCreateModal = () => {
    setEditingTask(null);
    setFormModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormModalOpen(true);
  };

  const openDetailPanel = (task: Task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const confirmDelete = (taskId: string, title: string) => {
    setDeleteModal({ isOpen: true, taskId, taskTitle: title });
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await deletePlannerTask(plannerId, deleteModal.taskId);
      setDeleteModal({ isOpen: false, taskId: "", taskTitle: "" });
    } catch (err: any) {
      alert("Failed to delete task: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setOptimisticTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await updatePlannerTaskStatus(plannerId, taskId, newStatus as any);
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
      setOptimisticTasks(tasks);
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const task = optimisticTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const canChangeStatus =
      accessLevel === "admin" ||
      accessLevel === "manager" ||
      (accessLevel === "member" && !!currentUserId && task.assigned_member === currentUserId);

    if (!canChangeStatus) {
      alert("Unauthorized: You can only update tasks assigned to you.");
      return;
    }

    handleStatusChange(taskId, newStatus);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Task Board</h2>
        {accessLevel !== "member" && (
          <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = optimisticTasks.filter((t) => t.status === col.id);
          const isDragOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className="flex flex-col h-full"
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className={"px-4 py-3 rounded-t-xl border-t-2 border-x border-slate-200 font-semibold text-sm text-slate-700 flex items-center justify-between " + col.color + " " + col.accent}>
                {col.label}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs text-slate-500 border border-slate-200">
                  {colTasks.length}
                </span>
              </div>
              <div className={"border border-slate-200 border-t-0 rounded-b-xl p-3 min-h-[400px] flex flex-col gap-3 transition-colors " + (isDragOver ? "bg-indigo-50/50 ring-2 ring-indigo-200 ring-inset" : "bg-slate-50/50")}>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allMembers={allMembers}
                    accessLevel={accessLevel}
                    currentUserId={currentUserId}
                    onEdit={openEditModal}
                    onDelete={confirmDelete}
                    onClick={openDetailPanel}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <TaskFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        editingTask={editingTask}
        plannerId={plannerId}
        teams={teams}
        allMembers={allMembers}
      />

      {/* Task Detail Panel (subtasks + comments) */}
      <TaskDetailPanel
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        plannerId={plannerId}
        allMembers={allMembers}
        currentUserId={currentUserId}
        accessLevel={accessLevel}
        onStatusChange={(taskId, newStatus) => {
          handleStatusChange(taskId, newStatus);
          setDetailTask((prev) => (prev && prev.id === taskId ? { ...prev, status: newStatus } : prev));
        }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteTask}
        isDeleting={isDeleting}
        title="Delete Task"
        itemName={deleteModal.taskTitle}
      />
    </div>
  );
}
