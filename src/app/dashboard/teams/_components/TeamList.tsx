"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
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
import { addTeamAction, updateTeamAction, deleteTeamAction } from "../actions";
import { Team } from "./TeamClient"; // Make sure to export Team from TeamClient or define here

export function TeamList({ teams }: { teams: Team[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openNew = () => {
    setEditId(null);
    setName("");
    setIsOpen(true);
  };

  const openEdit = (t: Team) => {
    setEditId(t.id);
    setName(t.name);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateTeamAction(editId, name);
      } else {
        await addTeamAction(name);
      }
      setIsOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    try {
      await deleteTeamAction(id);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Teams</h2>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Team</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Team" : "Add New Team"}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design Team" />
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
              <TableHead className="w-full">Team Name</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">No teams found.</TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium text-slate-900">{team.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(team)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)} className="text-slate-400 hover:text-red-600">
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
