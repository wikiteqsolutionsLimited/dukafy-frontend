import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickViewField {
  label: string;
  value: string | React.ReactNode;
}

interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar?: string;
  fields: QuickViewField[];
}

export function QuickViewModal({ open, onClose, title, subtitle, avatar, fields }: QuickViewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            {avatar && (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-2xl">
                {avatar}
              </span>
            )}
            <div>
              <h3 className="text-base font-bold text-card-foreground">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="divide-y">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <span className={cn("text-sm font-medium text-card-foreground text-right max-w-[60%] truncate")}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border bg-card px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.97]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
