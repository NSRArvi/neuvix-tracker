/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentItem {
  name: string;
  url: string;
}

interface ProjectDocumentsTabProps {
  documents: DocumentItem[];
  addDocument: () => void;
  removeDocument: (index: number) => void;
  handleDocumentChange: (index: number, field: string, value: string) => void;
}

export function ProjectDocumentsTab({
  documents,
  addDocument,
  removeDocument,
  handleDocumentChange,
}: ProjectDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Documents Links
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attach Google Drive links, GitHub repositories, Figma files, or contracts.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDocument}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {documents.map((doc: DocumentItem, index: number) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  File/Link Name
                </label>
                <Input
                  type="text"
                  value={doc.name}
                  onChange={(e) =>
                    handleDocumentChange(index, "name", e.target.value)
                  }
                  placeholder="e.g. Github Repo, Assets Drive"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  URL
                </label>
                <Input
                  type="url"
                  value={doc.url}
                  onChange={(e) =>
                    handleDocumentChange(index, "url", e.target.value)
                  }
                  placeholder="https://..."
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDocument(index)}
              disabled={documents.length === 1}
              className="mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remove document link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

