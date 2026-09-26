"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, Users, AlertCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPlannerTask, updatePlannerTask, updatePlannerTaskStatus, deletePlannerTask } from "../actions";

interface Task {
  id: string;
  planner_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  status: string;
  assigned_team?: string | null;
}

interface PlannerTasksKanbanProps {
  plannerId: string;
  tasks: Task[];
  teams: { name: string }[];
  accessLevel: string;
}

const COLUMNS = [
  { id: "pending", label: "Pending", color: "bg-slate-100" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-50" },
  { id: "completed", label: "Completed", color: "bg-emerald-50" },
];

export function PlannerTasksKanban({ plannerId, tasks, teams, accessLevel }: PlannerTasksKanbanProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New/Edit task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
    assigned_team: "",
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: "",
    taskTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic UI state for Drag and Drop
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks || []);

  // Sync optimistic state when real tasks update
  React.useEffect(() => {
    setOptimisticTasks(tasks || []);
  }, [tasks]);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTaskForm({ title: "", description: "", due_date: "", assigned_team: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date ? task.due_date.split('T')[0] : "", // ensure it's YYYY-MM-DD
      assigned_team: task.assigned_team || "",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) {
      setError("Task title is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description || null,
        due_date: taskForm.due_date || null,
        assigned_team: taskForm.assigned_team || null,
      };

      if (editingTaskId) {
        await updatePlannerTask(plannerId, editingTaskId, payload);
      } else {
        await createPlannerTask(plannerId, payload);
      }
      
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    // Optimistic update
    setOptimisticTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updatePlannerTaskStatus(plannerId, taskId, newStatus);
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
      // Revert optimistic update
      setOptimisticTasks(tasks);
    }
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

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    // Only call update if status actually changed
    const task = optimisticTasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      handleStatusChange(taskId, newStatus as any);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Task Board</h2>
        {accessLevel !== 'member' && (
          <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const colTasks = optimisticTasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className="flex flex-col h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className={`px-4 py-3 rounded-t-xl border-t border-x border-slate-200 font-semibold text-sm text-slate-700 flex items-center justify-between ${col.color}`}>
                {col.label}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs text-slate-500 border border-slate-200">
                  {colTasks.length}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl p-3 min-h-[400px] flex flex-col gap-3 transition-colors hover:bg-slate-100/50">
                {colTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow group relative flex flex-col h-full cursor-grab active:cursor-grabbing"
                  >
                    
                    {accessLevel !== 'member' && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(task.id, task.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <h4 className="font-semibold text-slate-800 text-sm mb-1.5 pr-12">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
                    )}
                    
                    <div className="mt-auto pt-4 flex flex-col gap-2.5">
                      {task.assigned_team && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md">
                          <Users className="w-3 h-3" /> {task.assigned_team}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {task.due_date ? (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                          </div>
                        ) : (
                          <span />
                        )}
                        
                        <select 
                          className="text-[11px] font-semibold border-slate-200 rounded-md py-1 pl-2 pr-6 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-0 focus:border-indigo-400 cursor-pointer"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Task Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Task Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Design Homepage Wireframes"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                placeholder="Add more details here..."
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Assign Team</label>
                <select
                  value={taskForm.assigned_team}
                  onChange={(e) => setTaskForm({...taskForm, assigned_team: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {teams.filter(t => t.name).map((t, idx) => (
                    <option key={idx} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (editingTaskId ? "Save Changes" : "Create Task")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !isDeleting && setDeleteModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Delete Task
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteModal.taskTitle}"</span>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} disabled={isDeleting}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteTask} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
