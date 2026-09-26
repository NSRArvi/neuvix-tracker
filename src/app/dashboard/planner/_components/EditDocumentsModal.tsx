"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Document {
  name: string;
  url: string;
}

interface EditDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDocuments: Document[];
  onSave: (documents: Document[]) => Promise<void>;
}

export function EditDocumentsModal({
  open,
  onOpenChange,
  initialDocuments,
  onSave,
}: EditDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDocuments(initialDocuments || []);
      setError(null);
    }
  }, [open, initialDocuments]);

  const handleAddDoc = () => {
    setDocuments([...documents, { name: "", url: "" }]);
  };

  const handleDocChange = (index: number, field: "name" | "url", value: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  const handleRemoveDoc = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);
  };

  const handleSaveDocs = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Filter out completely empty docs before saving
      const validDocs = documents.filter(d => d.name.trim() || d.url.trim());
      await onSave(validDocs);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save documents.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Documents</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}
          
          {documents.map((doc, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Document Name (e.g. Brief)"
                  value={doc.name}
                  onChange={(e) => handleDocChange(index, "name", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={doc.url}
                  onChange={(e) => handleDocChange(index, "url", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDoc(index)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDoc}
            className="w-full border-dashed border-2 text-slate-600 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Document
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveDocs} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

