"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import {
  UploadCloud,
  FileText,
  Calendar,
  Loader2,
  Trash2,
  Eye,
  CheckCircle2,
} from "lucide-react"

export interface TeamPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamName: string
  amount: string | number
  initialPaidDate?: string
  initialProofUrl?: string
  projectId?: string
  onConfirm: (data: { paidDate: string; proofUrl: string }) => Promise<void> | void
}

export function TeamPaymentModal({
  open,
  onOpenChange,
  teamName,
  amount,
  initialPaidDate,
  initialProofUrl,
  projectId,
  onConfirm,
}: TeamPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <TeamPaymentModalInner
          onOpenChange={onOpenChange}
          teamName={teamName}
          amount={amount}
          initialPaidDate={initialPaidDate}
          initialProofUrl={initialProofUrl}
          projectId={projectId}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  )
}

function TeamPaymentModalInner({
  onOpenChange,
  teamName,
  amount,
  initialPaidDate,
  initialProofUrl,
  projectId,
  onConfirm,
}: Omit<TeamPaymentModalProps, "open">) {
  const [paidDate, setPaidDate] = React.useState(
    () => initialPaidDate || new Date().toISOString().split("T")[0]
  )
  const [proofUrl, setProofUrl] = React.useState(() => initialProofUrl || "")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [filePreview, setFilePreview] = React.useState<string | null>(
    () => initialProofUrl || null
  )
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Please upload an image file (PNG, JPG, WEBP) or PDF document.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB.")
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file)
      setFilePreview(preview)
    } else {
      setFilePreview("pdf")
    }
  }

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const supabase = createClient()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `payments/${projectId || "general"}/${Date.now()}_${cleanFileName}`

    // Attempt upload to 'payment-proofs' bucket
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath)
      return publicUrlData.publicUrl
    }

    console.warn(
      "Supabase storage bucket 'payment-proofs' upload failed or bucket doesn't exist, falling back to base64 Data URL:",
      uploadError.message
    )

    // Fallback to base64 Data URL if bucket is not created yet
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      let finalProofUrl = proofUrl

      if (selectedFile) {
        setUploading(true)
        finalProofUrl = await uploadFileToSupabase(selectedFile)
        setUploading(false)
      }

      await onConfirm({
        paidDate: paidDate || new Date().toISOString().split("T")[0],
        proofUrl: finalProofUrl,
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record payment"
      console.error("Payment confirmation error:", err)
      alert(message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-2xl shadow-2xl">
      <DialogHeader className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Mark Team Payment as Paid
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm payment and attach receipt proof for {teamName}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Summary Box */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Team</span>
            <span className="text-sm font-semibold text-foreground">{teamName}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block font-medium">Amount Due</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${Number(amount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Payment Date
          </label>
          <Input
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="bg-card text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Defaults to today. Adjust if payment was made on a different date.
          </span>
        </div>

        {/* Payment Proof Upload (Image or PDF only) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Proof Document (Image or PDF)
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {!selectedFile && !proofUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20 hover:bg-muted/40 group"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Click to upload payment receipt or invoice
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PNG, JPG, WEBP, or PDF up to 10MB
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {selectedFile ? (
                  filePreview === "pdf" ? (
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filePreview!}
                      alt="Proof preview"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
                    />
                  )
                ) : proofUrl.endsWith(".pdf") || proofUrl.includes("application/pdf") ? (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proofUrl}
                    alt="Proof document"
                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {selectedFile
                      ? selectedFile.name
                      : "Attached Proof Document"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "Ready on server"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {(filePreview && filePreview !== "pdf") || proofUrl ? (
                  <a
                    href={filePreview && filePreview !== "pdf" ? filePreview : proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                    title="View document"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => {
                    setSelectedFile(null)
                    setFilePreview(null)
                    setProofUrl("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={saving || uploading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="gap-2"
        >
          {saving || uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm Payment
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

