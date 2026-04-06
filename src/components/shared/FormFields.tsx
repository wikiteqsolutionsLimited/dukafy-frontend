import { cn } from "@/lib/utils";
import React from "react";

/* ── FormField wrapper ── */
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, optional, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1 text-sm font-medium text-card-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-xs text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Shared input class ── */
export function inputClassName(error?: string) {
  return cn(
    "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md",
    error && "border-destructive focus:ring-destructive/30"
  );
}

/* ── FormInput ── */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

export function FormInput({ label, error, required, optional, className, ...props }: FormInputProps) {
  return (
    <FormField label={label} error={error} required={required} optional={optional} className={className}>
      <input {...props} className={inputClassName(error)} />
    </FormField>
  );
}

/* ── FormSelect ── */
interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormSelect({ label, value, onChange, options, placeholder, error, required, className }: FormSelectProps) {
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName(error)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FormField>
  );
}

/* ── FormTextarea ── */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormTextarea({ label, error, required, className, ...props }: FormTextareaProps) {
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <textarea
        {...props}
        className={cn(
          "w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md",
          error && "border-destructive focus:ring-destructive/30"
        )}
      />
    </FormField>
  );
}
