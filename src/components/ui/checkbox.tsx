"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center justify-center w-4 h-4", className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onCheckedChange?.(e.target.checked);
          }}
          className={cn(
            "peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          )}
          {...props}
        />
        <div
          className={cn(
            "w-full h-full shrink-0 rounded-sm border border-primary ring-offset-background peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "flex items-center justify-center transition-colors bg-background",
            checked ? "bg-primary border-primary text-primary-foreground" : ""
          )}
        >
          <Check className={cn("h-3 w-3 text-primary-foreground", checked ? "opacity-100" : "opacity-0")} />
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
