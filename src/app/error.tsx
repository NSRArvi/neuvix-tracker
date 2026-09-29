"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, send this to an error tracking service (e.g. Sentry)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error?.message || "An unexpected error occurred. Please try again or return to safety."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RefreshCcw className="w-4 h-4 mr-1.5" /> Try Again
          </Button>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            <Home className="w-4 h-4 mr-1.5" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
