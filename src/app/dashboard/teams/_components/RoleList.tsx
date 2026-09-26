"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addRoleAction, updateRoleAction, deleteRoleAction } from "../actions";
import { Role } from "./TeamClient";

export function RoleList({ roles }: { roles: Role[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");

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
      onConfirm: () => setAlertDialog(prev => ({ ...prev, isOpen: false })),
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      isConfirm: true,
      onConfirm: () => {
        onConfirm();
        setAlertDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openNew = () => {
    setEditId(null);
    setName("");
    setIsOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditId(r.id);
    setName(r.name);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateRoleAction(editId, name);
      } else {
        await addRoleAction(name);
      }
      setIsOpen(false);
    } catch (err: unknown) {
      showAlert("Error", (err as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm("Delete Role", "Are you sure you want to delete this role? This action cannot be undone.", async () => {
      try {
        await deleteRoleAction(id);
      } catch (err: unknown) {
        showAlert("Error", (err as Error).message);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <Dialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${alertDialog.isConfirm ? 'text-amber-500' : 'text-red-500'}`} />
              {alertDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            {alertDialog.message}
          </div>
          <DialogFooter>
            {alertDialog.isConfirm && (
              <Button type="button" variant="outline" onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
                Cancel
              </Button>
            )}
            <Button type="button" className={alertDialog.isConfirm ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"} onClick={alertDialog.onConfirm}>
              {alertDialog.isConfirm ? "Confirm" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Roles</h2>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Role</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Role" : "Add New Role"}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Developer" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-full">Role Name</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">No roles found.</TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-slate-900">{role.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(role)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
