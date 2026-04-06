import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Users, ShoppingCart, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  label: string;
  description: string;
  category: "product" | "customer" | "order";
  path: string;
}

const dummyData: SearchItem[] = [
  { id: "p1", label: "Wireless Earbuds", description: "Electronics · $49.99 · 24 in stock", category: "product", path: "/inventory" },
  { id: "p2", label: "Yoga Mat Premium", description: "Sports · $29.99 · 0 in stock", category: "product", path: "/inventory" },
  { id: "p3", label: "Organic Coffee Beans", description: "Groceries · $14.50 · 58 in stock", category: "product", path: "/inventory" },
  { id: "p4", label: "LED Desk Lamp", description: "Electronics · $35.00 · 12 in stock", category: "product", path: "/inventory" },
  { id: "p5", label: "Cotton T-Shirt", description: "Clothing · $19.99 · 150 in stock", category: "product", path: "/inventory" },
  { id: "c1", label: "Alice Johnson", description: "alice@example.com · (555) 123-4567", category: "customer", path: "/customers" },
  { id: "c2", label: "Bob Martinez", description: "bob.m@mail.com · (555) 987-6543", category: "customer", path: "/customers" },
  { id: "c3", label: "Carol Williams", description: "carol.w@company.co · (555) 456-7890", category: "customer", path: "/customers" },
  { id: "o1", label: "Order #ORD-4998", description: "Alice Johnson · $128.50 · Completed", category: "order", path: "/sales-history" },
  { id: "o2", label: "Order #ORD-4997", description: "Bob Martinez · $45.00 · Completed", category: "order", path: "/sales-history" },
  { id: "o3", label: "Order #ORD-4996", description: "Carol Williams · $312.75 · Pending", category: "order", path: "/sales-history" },
];

const categoryConfig = {
  product: { icon: Package, label: "Products", color: "text-primary" },
  customer: { icon: Users, label: "Customers", color: "text-success" },
  order: { icon: ShoppingCart, label: "Orders", color: "text-warning" },
};

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return dummyData;
    const q = query.toLowerCase();
    return dummyData.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    for (const item of filtered) {
      (groups[item.category] ??= []).push(item);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatItems = useMemo(() => {
    const items: SearchItem[] = [];
    for (const cat of ["product", "customer", "order"] as const) {
      if (grouped[cat]) items.push(...grouped[cat]);
    }
    return items;
  }, [grouped]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const select = useCallback(
    (item: SearchItem) => {
      onClose();
      navigate(item.path);
    },
    [navigate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatItems[activeIndex]) {
        e.preventDefault();
        select(flatItems[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatItems, activeIndex, select, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 fade-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 h-12">
          <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, customers, orders..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {flatItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground/60">Try a different search term</p>
            </div>
          ) : (
            (["product", "customer", "order"] as const).map((cat) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              const cfg = categoryConfig[cat];
              const CatIcon = cfg.icon;

              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                    <CatIcon className={cn("h-3.5 w-3.5", cfg.color)} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{items.length}</span>
                  </div>
                  {items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => select(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-100",
                          isActive ? "bg-accent" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm truncate", isActive ? "font-semibold text-accent-foreground" : "font-medium text-foreground")}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        {isActive && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground/60">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> Select</span>
            <span>↑↓ Navigate</span>
          </div>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
