import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Clock } from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const fetchTickets = () => {
    setLoading(true);
    adminApi.getTickets({ status: statusFilter || undefined, limit: 50 })
      .then(r => setTickets(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const viewTicket = async (id: number) => {
    try {
      const r = await adminApi.getTicket(id);
      setDetail(r.data);
    } catch { toast({ title: "Error loading ticket", variant: "destructive" }); }
  };

  const sendReply = async () => {
    if (!detail || !replyText.trim()) return;
    try {
      await adminApi.replyToTicket(detail.id, replyText);
      toast({ title: "Reply sent" });
      setReplyText("");
      viewTicket(detail.id);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateTicket(id, { status });
      toast({ title: `Ticket ${status}` });
      fetchTickets();
      if (detail?.id === id) viewTicket(id);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const priorityColor = (p: string) => {
    switch (p) { case "urgent": return "bg-red-600/20 text-red-400"; case "high": return "bg-orange-600/20 text-orange-400"; case "medium": return "bg-yellow-600/20 text-yellow-400"; default: return "bg-slate-600/20 text-slate-400"; }
  };

  const statusColor = (s: string) => {
    switch (s) { case "open": return "bg-blue-600/20 text-blue-400"; case "in_progress": return "bg-yellow-600/20 text-yellow-400"; case "resolved": return "bg-emerald-600/20 text-emerald-400"; default: return "bg-slate-600/20 text-slate-400"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No tickets found</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {tickets.map(t => (
                <div key={t.id} className="p-4 hover:bg-slate-800/30 cursor-pointer" onClick={() => viewTicket(t.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{t.subject}</p>
                      <p className="text-xs text-slate-400 mt-1">{t.user_name || "Unknown"} · {t.shop_name || "No shop"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColor(t.priority)}>{t.priority}</Badge>
                      <Badge className={statusColor(t.status)}>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.created_at).toLocaleString()}</span>
                    {t.assigned_name && <span>Assigned: {t.assigned_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.subject}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge className={priorityColor(detail.priority)}>{detail.priority}</Badge>
                <Badge className={statusColor(detail.status)}>{detail.status}</Badge>
                <span className="text-slate-400">from {detail.user_name} · {detail.shop_name || "No shop"}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 text-sm text-slate-300">{detail.message}</div>

              {detail.replies?.length > 0 && (
                <div className="space-y-3">
                  {detail.replies.map((r: any) => (
                    <div key={r.id} className={`p-3 rounded-lg text-sm ${r.sender_type === "admin" ? "bg-emerald-900/20 border border-emerald-800/30 ml-8" : "bg-slate-800 mr-8"}`}>
                      <p className="text-xs text-slate-500 mb-1">{r.sender_name} · {new Date(r.created_at).toLocaleString()}</p>
                      <p className="text-slate-300">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[80px]" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {detail.status !== "resolved" && <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => updateStatus(detail.id, "resolved")}>Resolve</Button>}
                    {detail.status !== "closed" && <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => updateStatus(detail.id, "closed")}>Close</Button>}
                  </div>
                  <Button size="sm" onClick={sendReply} disabled={!replyText.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="h-4 w-4 mr-1" /> Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
