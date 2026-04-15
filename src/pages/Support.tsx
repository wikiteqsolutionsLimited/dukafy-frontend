import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HeadphonesIcon, Plus, MessageCircle, Clock, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supportTicketsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { Modal } from "@/components/shared/Modal";
import { FormInput, FormTextarea, FormSelect } from "@/components/shared/FormFields";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Open", color: "bg-blue-500/10 text-blue-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-warning/10 text-warning", icon: Loader2 },
  resolved: { label: "Resolved", color: "bg-success/10 text-success", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const SupportPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [form, setForm] = useState({ subject: "", message: "", category: "general", priority: "medium" });

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => supportTicketsApi.getAll(),
  });

  const { data: ticketDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["support-ticket", viewTicket?.id],
    queryFn: () => supportTicketsApi.getById(viewTicket.id),
    enabled: !!viewTicket,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => supportTicketsApi.create(data),
    onSuccess: () => {
      toast.success("Support ticket created");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setCreateOpen(false);
      setForm({ subject: "", message: "", category: "general", priority: "medium" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) => supportTicketsApi.reply(id, message),
    onSuccess: () => {
      toast.success("Reply sent");
      queryClient.invalidateQueries({ queryKey: ["support-ticket", viewTicket?.id] });
      setReplyText("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const tickets = data?.data || [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Support" description="Get help from the DukaFy team">
        <PrimaryButton icon={Plus} onClick={() => setCreateOpen(true)}>New Ticket</PrimaryButton>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={HeadphonesIcon}
          title="No support tickets"
          description="Need help? Create a support ticket and our team will respond."
          actionLabel="Create Ticket"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: any) => {
            const status = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = status.icon;
            return (
              <button
                key={ticket.id}
                onClick={() => setViewTicket(ticket)}
                className="w-full text-left rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground truncate">{ticket.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="capitalize">{ticket.category}</span>
                      {ticket.reply_count > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {ticket.reply_count} replies
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", status.color)}>
                    <StatusIcon className="h-3 w-3" /> {status.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Support Ticket"
        icon={HeadphonesIcon}
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="h-10 flex-1 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.subject.trim() || !form.message.trim() || createMutation.isPending}
              className="h-10 flex-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Ticket"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Subject" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Category" value={form.category} onChange={(v) => setForm(f => ({ ...f, category: v }))} options={[
              { label: "General", value: "general" },
              { label: "Billing", value: "billing" },
              { label: "Technical", value: "technical" },
              { label: "Feature Request", value: "feature" },
            ]} />
            <FormSelect label="Priority" value={form.priority} onChange={(v) => setForm(f => ({ ...f, priority: v }))} options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]} />
          </div>
          <FormTextarea label="Message" value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={5} required />
        </div>
      </Modal>

      {/* View Ticket Modal */}
      <Modal
        open={!!viewTicket}
        onClose={() => { setViewTicket(null); setReplyText(""); }}
        title={viewTicket?.subject || "Ticket"}
        icon={MessageCircle}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : ticketDetail?.data ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-foreground">{ticketDetail.data.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(ticketDetail.data.created_at).toLocaleString()}</p>
            </div>

            {ticketDetail.data.replies?.length > 0 && (
              <div className="space-y-3">
                {ticketDetail.data.replies.map((reply: any) => (
                  <div key={reply.id} className={cn(
                    "rounded-lg p-3",
                    reply.sender_type === "admin" ? "bg-primary/5 border border-primary/20 ml-4" : "bg-muted/50 mr-4"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-card-foreground">{reply.sender_name || (reply.sender_type === "admin" ? "DukaFy Support" : "You")}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(reply.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            {ticketDetail.data.status !== "closed" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && replyText.trim()) {
                      replyMutation.mutate({ id: viewTicket.id, message: replyText });
                    }
                  }}
                />
                <button
                  onClick={() => replyText.trim() && replyMutation.mutate({ id: viewTicket.id, message: replyText })}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="h-10 px-4 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default SupportPage;
