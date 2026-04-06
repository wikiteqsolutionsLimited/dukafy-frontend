import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  className?: string;
}

export function TableSkeleton({ columns, rows = 5, className }: TableSkeletonProps) {
  const widths = [65, 80, 50, 70, 55, 45, 75, 60];

  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-5 py-3.5 text-left">
                  <div
                    className="h-3 rounded bg-muted skeleton-pulse"
                    style={{ width: `${widths[i % widths.length]}px`, animationDelay: `${i * 80}ms` }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className={cn("border-b last:border-0", row % 2 === 1 && "bg-muted/15")}>
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="px-5 py-4">
                    <div
                      className="h-3 rounded bg-muted skeleton-pulse"
                      style={{
                        width: `${widths[(row + col) % widths.length]}%`,
                        animationDelay: `${(row * columns + col) * 50}ms`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
