import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/shared/Modal";
import { Printer, Download, Plus, Minus } from "lucide-react";
import JsBarcode from "jsbarcode";

interface BarcodeModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    barcode: string;
    sell_price: number;
  } | null;
}

export function BarcodeModal({ open, onClose, product }: BarcodeModalProps) {
  const [copies, setCopies] = useState(1);
  const [showPrice, setShowPrice] = useState(true);
  const [showName, setShowName] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const barcodeValue = product?.barcode || `PRD-${String(product?.id || 0).padStart(6, "0")}`;

  const renderBarcode = useCallback(() => {
    if (!canvasRef.current || !open || !product) return;
    try {
      JsBarcode(canvasRef.current, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch {
      // fallback for invalid barcode
    }
  }, [barcodeValue, open, product]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  const handlePrint = () => {
    if (!canvasRef.current || !product) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const stickers = Array.from({ length: copies })
      .map(
        () => `
      <div style="display:inline-block;text-align:center;padding:8px;margin:4px;border:1px dashed #ccc;page-break-inside:avoid;">
        ${showName ? `<div style="font-size:11px;font-weight:bold;margin-bottom:4px;">${product.name}</div>` : ""}
        <img src="${dataUrl}" style="max-width:200px;" />
        ${showPrice ? `<div style="font-size:12px;font-weight:bold;margin-top:4px;">KES ${Number(product.sell_price).toLocaleString()}</div>` : ""}
      </div>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Barcode - ${product.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;}@media print{body{padding:0;}.no-print{display:none!important;}}</style>
      </head><body>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${stickers}</div>
      <script>window.onload=function(){window.print();window.close();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!canvasRef.current || !product) return;
    const link = document.createElement("a");
    link.download = `barcode-${product.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title="Product Barcode">
      <div className="space-y-5">
        {/* Preview */}
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-white p-6">
          {showName && (
            <p className="text-sm font-bold text-gray-900">{product.name}</p>
          )}
          <canvas ref={canvasRef} />
          {showPrice && (
            <p className="text-sm font-bold text-gray-900">
              KES {Number(product.sell_price).toLocaleString()}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Show product name</label>
            <button
              onClick={() => setShowName(!showName)}
              className={`relative h-6 w-11 rounded-full transition-colors ${showName ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${showName ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Show price</label>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`relative h-6 w-11 rounded-full transition-colors ${showPrice ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${showPrice ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Number of copies</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCopies(Math.max(1, copies - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-foreground">{copies}</span>
              <button
                onClick={() => setCopies(Math.min(100, copies + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 h-10 items-center justify-center gap-2 rounded-lg border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" /> Print {copies > 1 ? `(${copies})` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}
