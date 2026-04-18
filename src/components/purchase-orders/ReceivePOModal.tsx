import { useEffect, useState } from "react";
import { Loader2, PackageCheck } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { purchaseOrdersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

interface POItem {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  quantity_received: number | null;
  unit_price: number;
}

interface Props {
  open: boolean;
  orderId: number | null;
  reference?: string;
  onClose: () => void;
  onCompleted: () => void;
}

export function ReceivePOModal({ open, orderId, reference, onClose, onCompleted }: Props) {
  const [items, setItems] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [received, setReceived] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    purchaseOrdersApi
      .getById(orderId)
      .then((res) => {
        const its: POItem[] = res.data?.items || [];
        setItems(its);
        // default each input to ordered quantity (editable)
        const map: Record<number, string> = {};
        its.forEach((it) => {
          map[it.id] = String(it.quantity_received && it.quantity_received > 0 ? it.quantity_received : it.quantity);
        });
        setReceived(map);
      })
      .catch((e) => toast.error(e.message || "Failed to load order"))
      .finally(() => setLoading(false));
  }, [open, orderId]);

  const handleConfirm = async () => {
    if (!orderId) return;
    const payload = items.map((it) => ({
      id: it.id,
      quantity_received: Math.max(0, parseInt(received[it.id] || "0", 10) || 0),
    }));
    setSubmitting(true);
    try {
      await purchaseOrdersApi.updateStatus(orderId, "completed", payload);
      toast.success("Stock received and order completed");
      onCompleted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Receive Stock — ${reference || ""}`}
      icon={PackageCheck}
      size="2xl"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-10 flex-1 rounded-lg border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || loading || items.length === 0}
            className="h-10 flex-1 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Confirm & Add to Stock"}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Edit the received quantity per item. Defaults to the ordered quantity. Stock will be added to your inventory upon confirmation.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ordered</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Received</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-card-foreground">{it.product_name}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{it.quantity}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={received[it.id] ?? ""}
                        onChange={(e) =>
                          setReceived((prev) => ({ ...prev, [it.id]: e.target.value }))
                        }
                        className="h-9 w-24 rounded-lg border bg-background text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {formatCurrency(Number(it.unit_price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
