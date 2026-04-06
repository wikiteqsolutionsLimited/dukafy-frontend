import { cn } from "@/lib/utils";

interface CardSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardSection({ title, description, children, className }: CardSectionProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md",
      className
    )}>
      {title && <h2 className="text-base font-bold text-card-foreground">{title}</h2>}
      {description && <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
