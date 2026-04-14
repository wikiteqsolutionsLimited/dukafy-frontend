import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function AdminEmailPage() {
  const [form, setForm] = useState({ to: "", subject: "", html_content: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to || !form.subject || !form.html_content) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await adminApi.sendEmail(form);
      toast({ title: "Email sent successfully!" });
      setForm({ to: "", subject: "", html_content: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">Send Email</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div><Label className="text-slate-300">To (Email)</Label><Input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} type="email" placeholder="shop@example.com" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Subject</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject line" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Message (HTML)</Label><Textarea value={form.html_content} onChange={e => setForm({ ...form, html_content: e.target.value })} placeholder="<h2>Hello!</h2><p>Your message here...</p>" className="bg-slate-800 border-slate-700 text-white min-h-[150px]" /></div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" /> {loading ? "Sending..." : "Send Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
