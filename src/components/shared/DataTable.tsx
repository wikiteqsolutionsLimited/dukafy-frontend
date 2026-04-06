import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";

/* ── Column Definition ── */
export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => React.ReactNode;
}

/* ── Pagination ── */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function PaginationButton({
  onClick,
  disabled,
  active,
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Smart page number display — show max 5 pages with ellipsis
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-1">
        <PaginationButton onClick={() => onPageChange(1)} disabled={currentPage <= 1}>
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>
        {getPages().map((n, i) =>
          n === "ellipsis" ? (
            <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">…</span>
          ) : (
            <PaginationButton key={n} onClick={() => onPageChange(n)} active={n === currentPage}>
              {n}
            </PaginationButton>
          )
        )}
        <PaginationButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  );
}

/* ── DataTable ── */
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  emptyDescription?: string;
  loading?: boolean;
  pagination?: PaginationProps;
  title?: string;
  description?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found",
  emptyDescription = "There are no records to display yet.",
  loading = false,
  pagination,
  title,
  description,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="animate-fade-in">
        {(title || description) && (
          <div className="mb-0 rounded-t-xl border border-b-0 bg-card px-5 py-4">
            {title && <div className="h-4 w-32 animate-pulse rounded bg-muted" />}
            {description && <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />}
          </div>
        )}
        <TableSkeleton columns={columns.length} rows={6} className={title ? "rounded-t-none" : ""} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {(title || description) && (
        <div className="border-b px-5 py-4">
          {title && <h2 className="text-base font-semibold text-card-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "sticky top-0 z-10 bg-muted/40 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16">
                  <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Inbox className="h-7 w-7 text-muted-foreground/50" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{emptyMessage}</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    "border-b last:border-0 transition-colors duration-150",
                    idx % 2 === 1 ? "bg-muted/15" : "bg-transparent",
                    "hover:bg-primary/[0.04]"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-5 py-4",
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      )}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
