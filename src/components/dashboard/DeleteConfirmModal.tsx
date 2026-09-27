"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: React.ReactNode;
  itemName?: string;
  isConfirm?: boolean;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isConfirm = true,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isDeleting && !open && onClose()}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle
              className={`w-5 h-5 ${isConfirm ? "text-red-500" : "text-amber-500"}`}
            />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-slate-600 dark:text-slate-300">
          {message ? (
            message
          ) : (
            <>
              Are you sure you want to delete{" "}
              {itemName && (
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  "{itemName}"
                </span>
              )}
              ? This action cannot be undone.
            </>
          )}
        </div>
        <DialogFooter>
          {isConfirm && (
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
          )}
          <Button
            className={
              isConfirm
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : isConfirm ? "Delete" : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
