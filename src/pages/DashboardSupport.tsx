import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle, Send, Clock, CheckCircle2, XCircle, Plus, ArrowLeft,
  MessageSquare, HelpCircle, Bug, CreditCard, Shield, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/services/api";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "general", label: "General Inquiry", icon: HelpCircle },
  { value: "transaction", label: "Transaction Issue", icon: CreditCard },
  { value: "technical", label: "Technical Problem", icon: Bug },
  { value: "account", label: "Account & KYC", icon: Shield },
  { value: "wallet", label: "Wallet & Funds", icon: CreditCard },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "text-warning bg-warning/10", icon: Clock },
  in_progress: { label: "In Progress", color: "text-chart-1 bg-chart-1/10", icon: MessageSquare },
  resolved: { label: "Resolved", color: "text-success bg-success/10", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-muted-foreground bg-muted", icon: XCircle },
};

export default function DashboardSupport() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");

  // Admin reply
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [replying, setReplying] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/support/tickets");
      if (data) {
        setTickets(data.map((t: any) => ({
          ...t,
          admin_reply: t.adminReply,
          replied_by: t.repliedBy,
          replied_at: t.repliedAt,
          created_at: t.createdAt,
          user_id: t.userId,
        })));
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Removed direct sendNotification as it's now handled by the backend

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing fields", description: "Please fill subject and message.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category,
        }),
      });
      toast({ title: "Ticket submitted!", description: "Our team will respond shortly." });
      setCreateOpen(false);
      setSubject("");
      setMessage("");
      setCategory("general");
      fetchTickets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminReply = async () => {
    if (!viewTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      await apiFetch(`/support/tickets/${viewTicket.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({
          reply_text: replyText.trim(),
          status: replyStatus,
        }),
      });
      toast({ title: "Reply sent!" });
      setReplyText("");
      setReplyStatus("");
      setViewTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReplying(false);
    }
  };

  const filtered = tickets.filter((t) => filterStatus === "all" || t.status === filterStatus);

  const getCatIcon = (cat: string) => {
    const c = CATEGORIES.find((c) => c.value === cat);
    return c ? c.icon : HelpCircle;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-primary p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground">
              {isAdmin ? "Support Tickets" : "Contact Support"}
            </h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">
              {isAdmin ? "View and respond to all user queries" : "Submit a query and our team will assist you"}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
            <Plus className="w-4 h-4 mr-1.5" /> New Ticket
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = tickets.filter((t) => t.status === key).length;
          const Icon = cfg.icon;
          const isActive = filterStatus === key;
          return (
            <div
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
              className={`rounded-xl bg-gradient-card border p-4 text-center cursor-pointer transition-all hover:shadow-md ${isActive ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
            >
              <div className={`w-9 h-9 rounded-full ${cfg.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{cfg.label}</p>
              <p className="text-xl font-heading font-bold text-foreground mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tickets List */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">
            {isAdmin ? "All Tickets" : "My Tickets"}
          </h2>
          <span className="text-xs text-muted-foreground ml-2">({filtered.length})</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {tickets.length === 0 ? "No tickets yet. Create one to get help!" : "No tickets match this filter."}
            </p>
            {!isAdmin && tickets.length === 0 && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create Ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((ticket) => {
              const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const StatusIcon = statusCfg.icon;
              const CatIcon = getCatIcon(ticket.category);
              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setViewTicket(ticket);
                    if (isAdmin) {
                      setReplyText(ticket.admin_reply || "");
                      setReplyStatus(ticket.status);
                    }
                  }}
                  className="p-4 hover:bg-secondary/30 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-lg ${statusCfg.color} flex items-center justify-center shrink-0`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </div>
                    {ticket.admin_reply && <Badge variant="outline" className="text-[10px] text-success border-success/30">Replied</Badge>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" /> New Support Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea
                placeholder="Describe your issue in detail. Include transaction IDs, screenshots info, or any relevant details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <p className="text-[10px] text-muted-foreground text-right">{message.length}/2000</p>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              <Send className="w-4 h-4 mr-1.5" /> {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={!!viewTicket} onOpenChange={(o) => !o && setViewTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-5 h-5 text-primary" />
              {viewTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {CATEGORIES.find((c) => c.value === viewTicket.category)?.label}
                </Badge>
                {(() => {
                  const cfg = STATUS_CONFIG[viewTicket.status] || STATUS_CONFIG.open;
                  return (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      <cfg.icon className="w-3 h-3" /> {cfg.label}
                    </div>
                  );
                })()}
                <span className="text-xs text-muted-foreground">
                  {new Date(viewTicket.created_at).toLocaleString("en-IN")}
                </span>
              </div>

              {/* User message */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Your Message</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{viewTicket.message}</p>
              </div>

              {/* Admin reply */}
              {viewTicket.admin_reply && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs text-primary mb-1 font-medium">Support Reply</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{viewTicket.admin_reply}</p>
                  {viewTicket.replied_at && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(viewTicket.replied_at).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              )}

              {/* Admin reply form */}
              {isAdmin && (
                <div className="space-y-3 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">Reply to this ticket</p>
                  <Textarea
                    placeholder="Write your response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center gap-3">
                    <Select value={replyStatus} onValueChange={setReplyStatus}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Update status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAdminReply} disabled={replying || !replyText.trim()} className="flex-1">
                      <Send className="w-4 h-4 mr-1" /> {replying ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
