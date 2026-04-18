import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calculator, Download, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSection } from "@/components/shared/CardSection";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/ActionButtons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { salesApi } from "@/lib/api";

interface VatRow {
  product_id: number;
  product_name: string;
  vat_rate: number;
  is_vat_inclusive: boolean;
  total_qty: number;
  net_sales: number;
  vat_amount: number;
  gross_sales: number;
}

const TaxReportPage = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const [from, setFrom] = useState<Date>(start);
  const [to, setTo] = useState<Date>(today);

  const { data, isLoading } = useQuery({
    queryKey: ["tax-report", from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const res = await salesApi.vatReport({
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd'T'23:59:59"),
      });
      return res.data;
    },
  });

  // Backend returns aggregate; if it returns rows, use them.
  const summary = data || {};
  const totalNet = Number(summary.total_net_sales || 0);
  const totalVat = Number(summary.total_vat_collected || 0);
  const totalGross = Number(summary.total_gross_sales || totalNet + totalVat);
  const rows: VatRow[] = summary.by_product || summary.rows || [];

  const columns: Column<VatRow>[] = [
    { key: "product_name", header: "Product", render: (r) => <span className="font-medium text-card-foreground">{r.product_name}</span> },
    { key: "vat_rate", header: "VAT Rate", render: (r) => <Badge>{Number(r.vat_rate || 0).toFixed(0)}%</Badge> },
    { key: "is_vat_inclusive", header: "Type", render: (r) => <span className="text-xs text-muted-foreground">{r.is_vat_inclusive ? "Inclusive" : "Exclusive"}</span> },
    { key: "total_qty", header: "Qty Sold", align: "right", render: (r) => <span>{r.total_qty}</span> },
    { key: "net_sales", header: "Net Sales", align: "right", render: (r) => <span>{formatCurrency(Number(r.net_sales || 0))}</span> },
    { key: "vat_amount", header: "VAT", align: "right", render: (r) => <span className="font-semibold text-primary">{formatCurrency(Number(r.vat_amount || 0))}</span> },
    { key: "gross_sales", header: "Gross", align: "right", render: (r) => <span className="font-semibold text-card-foreground">{formatCurrency(Number(r.gross_sales || 0))}</span> },
  ];

  const exportCsv = () => {
    const head = ["Product", "VAT Rate %", "Type", "Qty", "Net", "VAT", "Gross"];
    const lines = [head.join(",")];
    rows.forEach((r) => {
      lines.push([
        `"${r.product_name}"`, r.vat_rate, r.is_vat_inclusive ? "Inclusive" : "Exclusive",
        r.total_qty, Number(r.net_sales || 0).toFixed(2), Number(r.vat_amount || 0).toFixed(2),
        Number(r.gross_sales || 0).toFixed(2),
      ].join(","));
    });
    lines.push("");
    lines.push(["TOTALS", "", "", "", totalNet.toFixed(2), totalVat.toFixed(2), totalGross.toFixed(2)].join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-report-${format(from, "yyyy-MM-dd")}_${format(to, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Tax Report" description="VAT collected on sales (per product, per date range)">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <CardSection title="Date Range">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start font-normal", !from && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />{format(from, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={from} onSelect={(d) => d && setFrom(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start font-normal", !to && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />{format(to, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={to} onSelect={(d) => d && setTo(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardSection>

      <div className="grid gap-4 sm:grid-cols-3">
        <CardSection className="text-center py-5">
          <p className="text-xs text-muted-foreground">Net Sales (excl. VAT)</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{formatCurrency(totalNet)}</p>
        </CardSection>
        <CardSection className="text-center py-5">
          <div className="flex h-9 w-9 mx-auto items-center justify-center rounded-lg bg-primary/10 mb-1">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Total VAT Collected</p>
          <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(totalVat)}</p>
        </CardSection>
        <CardSection className="text-center py-5">
          <p className="text-xs text-muted-foreground">Gross Sales</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{formatCurrency(totalGross)}</p>
        </CardSection>
      </div>

      <CardSection title="VAT by Product">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No VAT data for the selected period.
          </div>
        ) : (
          <DataTable columns={columns} data={rows} keyExtractor={(r) => r.product_id ?? r.product_name} />
        )}
      </CardSection>
    </div>
  );
};

export default TaxReportPage;
