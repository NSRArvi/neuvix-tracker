"use client";

import React, { useState } from "react";
import { Eye, Edit2, FolderKanban, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { deleteProject } from "../actions";

interface ProjectItem {
  id: string;
  name: string;
  budget: number | string;
  expected_delivery_date: string | null;
  client_name: string | null;
  client_email: string | null;
  network?: string | null;
  manager?: { name: string } | null;
}

export function ProjectsTableClient({
  projects,
  hasQuery,
  accessLevel = "member",
}: {
  projects: ProjectItem[];
  hasQuery: boolean;
  accessLevel?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      isConfirm: false,
      onConfirm: () => setAlertDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      isConfirm: true,
      onConfirm: () => {
        onConfirm();
        setAlertDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete Project",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      async () => {
        setIsDeleting(id);
        try {
          await deleteProject(id);
        } catch (err: unknown) {
          showAlert(
            "Error",
            "Failed to delete project: " + (err as Error).message,
          );
        } finally {
          setIsDeleting(null);
        }
      },
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={alertDialog.onConfirm}
        title={alertDialog.title}
        message={alertDialog.message}
        isConfirm={alertDialog.isConfirm}
      />

      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Project Details
            </TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Client
            </TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Budget
            </TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Manager
            </TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Status
            </TableHead>
            <TableHead className="uppercase text-xs font-semibold tracking-wider text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-slate-100">
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-medium text-slate-900">
                  {hasQuery
                    ? "No matching projects found"
                    : "No projects found"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {hasQuery
                    ? "Try searching for a different keyword."
                    : "Get started by creating a new project."}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow
                key={project.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900">
                    {project.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Due: {project.expected_delivery_date || "N/A"}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {project.client_name || "N/A"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {project.client_email}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-bold text-emerald-600">
                    $
                    {parseFloat(String(project.budget || 0)).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {project.manager?.name
                        ? project.manager.name.charAt(0)
                        : "?"}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">
                      {project.manager?.name || "Unassigned"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 tracking-wide uppercase">
                    Active
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/projects/${project.id}`)
                      }
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="View Project"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {accessLevel !== "member" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/projects/${project.id}/edit`,
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          disabled={isDeleting === project.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
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
