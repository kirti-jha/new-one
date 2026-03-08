import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, CheckCheck, Wallet, UserPlus, ShieldAlert, KeyRound, Ban, Settings2, FileText, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  fund_approved: Banknote,
  fund_rejected: Banknote,
  fund_request: Banknote,
  wallet_credit: Wallet,
  wallet_debit: Wallet,
  wallet_transfer: Wallet,
  user_created: UserPlus,
  role_changed: ShieldAlert,
  password_reset: KeyRound,
  account_blocked: Ban,
  account_unblocked: Check,
  service_toggle: Settings2,
  kyc_update: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  fund_approved: "text-success bg-success/10",
  fund_rejected: "text-destructive bg-destructive/10",
  fund_request: "text-primary bg-primary/10",
  wallet_credit: "text-success bg-success/10",
  wallet_debit: "text-warning bg-warning/10",
  wallet_transfer: "text-primary bg-primary/10",
  user_created: "text-chart-2 bg-chart-2/10",
  role_changed: "text-accent bg-accent/10",
  password_reset: "text-warning bg-warning/10",
  account_blocked: "text-destructive bg-destructive/10",
  account_unblocked: "text-success bg-success/10",
  service_toggle: "text-muted-foreground bg-muted",
  kyc_update: "text-primary bg-primary/10",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setNotifications(data as Notification[]);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 30));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-heading font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const colorClass = TYPE_COLORS[n.type] || "text-muted-foreground bg-muted";
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-secondary/30 ${!n.is_read ? "bg-primary/5" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
