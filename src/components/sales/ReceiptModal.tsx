import { forwardRef } from "react";
import { X, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  shopName?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
  date: Date;
  servedBy?: string;
  amountPaid?: number;
  change?: number;
}

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData;
}

const DASHED = "border-b border-dashed border-muted-foreground/30";

const ReceiptContent = forwardRef<HTMLDivElement, { data: ReceiptData }>(({ data }, ref) => (
  <div ref={ref} className="receipt-content mx-auto w-[280px] bg-card font-mono text-[11px] leading-tight text-card-foreground">
    {/* Header */}
    <div className={`${DASHED} pb-3 text-center`}>
      <p className="text-sm font-extrabold tracking-widest uppercase">{data.shopName || "DukaFlo"}</p>
      <p className="mt-1.5 text-[9px] text-muted-foreground leading-relaxed">
        123 Main Street, City<br />
        Tel: (555) 123-4567<br />
        VAT: 12-3456789
      </p>
    </div>

    {/* Date + ID */}
    <div className={`${DASHED} flex justify-between py-2 text-[9px] text-muted-foreground`}>
      <span>{data.date.toLocaleDateString()}&nbsp;&nbsp;{data.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      <span>#{data.transactionId || String(Math.floor(Math.random() * 90000 + 10000))}</span>
    </div>

    {/* Column header */}
    <div className={`${DASHED} flex py-1.5 text-[9px] font-bold uppercase text-muted-foreground`}>
      <span className="flex-1">Item</span>
      <span className="w-8 text-center">Qty</span>
      <span className="w-14 text-right">Price</span>
      <span className="w-16 text-right">Total</span>
    </div>

    {/* Items */}
    <div className={`${DASHED} py-2 space-y-1.5`}>
      {data.items.map((item, i) => (
        <div key={i} className="flex items-start">
          <span className="flex-1 min-w-0 truncate pr-1">{item.name}</span>
          <span className="w-8 text-center text-muted-foreground">{item.qty}</span>
          <span className="w-14 text-right text-muted-foreground">{item.price.toFixed(2)}</span>
          <span className="w-16 text-right font-medium">{(item.qty * item.price).toFixed(2)}</span>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className={`${DASHED} py-2 space-y-1`}>
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatCurrency(data.subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Tax (10%)</span>
        <span>{formatCurrency(data.tax)}</span>
      </div>
    </div>

    {/* Grand total */}
    <div className={`${DASHED} flex justify-between py-2.5 text-base font-extrabold`}>
      <span>TOTAL</span>
      <span>{formatCurrency(data.total)}</span>
    </div>

    {/* Payment & Change */}
    <div className={`${DASHED} py-2 space-y-1 text-[9px]`}>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Payment Method</span>
        <span className="font-semibold">{data.paymentMethod}</span>
      </div>
      {data.amountPaid !== undefined && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-semibold">{formatCurrency(data.amountPaid)}</span>
        </div>
      )}
      {data.change !== undefined && data.change > 0 && (
        <div className="flex justify-between font-bold">
          <span>Change</span>
          <span>{formatCurrency(data.change)}</span>
        </div>
      )}
    </div>
    <div className="flex justify-between py-1 text-[9px]">
      <span className="text-muted-foreground">Items</span>
      <span className="font-semibold">{data.items.reduce((s, i) => s + i.qty, 0)}</span>
    </div>

    {/* Served By */}
    {data.servedBy && (
      <div className="flex justify-between py-1 text-[9px]">
        <span className="text-muted-foreground">Served By</span>
        <span className="font-semibold">{data.servedBy}</span>
      </div>
    )}

    {/* Footer */}
    <div className="mt-3 border-t border-dashed border-muted-foreground/30 pt-3 text-center">
      <p className="text-[10px] font-semibold">Thank you for shopping with us!</p>
      <p className="mt-1 text-[8px] text-muted-foreground leading-relaxed">
        Returns accepted within 14 days with receipt<br />
        Visit us at www.dukaflo.co.ke
      </p>
      <div className="mx-auto mt-3 flex justify-center gap-[2px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="bg-card-foreground"
            style={{ width: Math.random() > 0.5 ? 2 : 1, height: 20 }}
          />
        ))}
      </div>
      <p className="mt-1 text-[8px] text-muted-foreground">
        {data.transactionId || String(Math.floor(Math.random() * 9000000 + 1000000))}
      </p>
    </div>
  </div>
));
ReceiptContent.displayName = "ReceiptContent";

export function ReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  const handlePrint = () => window.print();

  if (!open) return null;

  return (
    <>
      <style>{`
        @media print {
          body > *:not(.receipt-print-root) { display: none !important; }
          .receipt-print-root { position: static !important; }
          .receipt-print-root .receipt-backdrop,
          .receipt-print-root .receipt-actions { display: none !important; }
          .receipt-print-root .receipt-modal {
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-height: unset !important;
            background: white !important;
            border-radius: 0 !important;
            width: 280px !important;
            max-width: 280px !important;
          }
          .receipt-content {
            color: #000 !important;
            background: #fff !important;
          }
          .receipt-content * {
            color: #000 !important;
            border-color: #000 !important;
          }
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
        }
      `}</style>

      <div className="receipt-print-root fixed inset-0 z-50 flex items-center justify-center">
        <div className="receipt-backdrop absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

        <div className="receipt-modal relative z-10 mx-4 w-full max-w-[340px] animate-in fade-in zoom-in-95 rounded-xl border bg-card shadow-xl">
          {/* Header */}
          <div className="receipt-actions flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-card-foreground">Receipt Preview</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrint}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Print receipt"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Thermal receipt body */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-6 bg-gradient-to-b from-muted/30 to-transparent">
            <ReceiptContent data={data} />
          </div>

          {/* Footer buttons */}
          <div className="receipt-actions flex gap-3 border-t px-5 py-3">
            <button
              onClick={onClose}
              className="h-10 flex-1 rounded-lg border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
