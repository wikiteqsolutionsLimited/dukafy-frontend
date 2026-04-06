import { CheckCircle2, Printer, ShoppingCart } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { formatCurrency } from "@/lib/currency";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderConfirmationProps {
  open: boolean;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  servedBy?: string;
  amountPaid?: number;
  change?: number;
  onPrintReceipt: () => void;
  onNewSale: () => void;
}

export function OrderConfirmation({
  open,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  servedBy,
  amountPaid,
  change,
  onPrintReceipt,
  onNewSale,
}: OrderConfirmationProps) {
  return (
    <Modal
      open={open}
      onClose={onNewSale}
      title=""
      size="md"
      footer={
        <>
          <button
            onClick={onPrintReceipt}
            className="h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold text-card-foreground transition-colors hover:bg-muted"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
          <button
            onClick={onNewSale}
            className="h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
            New Sale
          </button>
        </>
      }
    >
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 pb-4 text-center -mt-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h2 className="text-xl font-bold text-card-foreground">Order Confirmed!</h2>
        <p className="text-sm text-muted-foreground">Your sale has been processed successfully</p>
      </div>

      {/* Order summary */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Summary</p>
        <div className="max-h-[160px] space-y-1.5 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="min-w-0 truncate text-card-foreground">
                {item.name} <span className="text-muted-foreground">×{item.qty}</span>
              </span>
              <span className="shrink-0 pl-3 font-medium text-card-foreground">
                {formatCurrency(item.qty * item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t pt-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tax (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment</span>
            <span>{paymentMethod}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold text-card-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {amountPaid !== undefined && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Amount Paid</span>
              <span className="font-semibold">{formatCurrency(amountPaid)}</span>
            </div>
          )}
          {change !== undefined && change > 0 && (
            <div className="flex justify-between text-sm font-bold text-success">
              <span>Change</span>
              <span>{formatCurrency(change)}</span>
            </div>
          )}
        </div>

        {servedBy && (
          <div className="mt-3 border-t pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Served By</span>
              <span className="font-semibold text-card-foreground">{servedBy}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
