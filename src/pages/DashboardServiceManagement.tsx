import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings2, ToggleLeft, ToggleRight, RefreshCw, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/services/api";

interface ServiceConfig {
  id: string;
  service_key: string;
  service_label: string;
  is_enabled: boolean;
  route_path: string;
  section: string;
}

export default function DashboardServiceManagement() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/service-config");
      if (data) {
        setServices(data.map((s: any) => ({
          id: s.id,
          service_key: s.serviceKey,
          service_label: s.serviceLabel,
          is_enabled: s.isEnabled,
          route_path: s.routePath,
          section: s.section || "Services",
        })));
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const toggleService = async (service: ServiceConfig) => {
    setToggling(service.service_key);
    try {
      await apiFetch(`/service-config/${service.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_enabled: !service.is_enabled }),
      });
      toast({
        title: `${service.service_label} ${!service.is_enabled ? "enabled" : "disabled"}`,
        description: !service.is_enabled
          ? "Service is now visible to all users."
          : "Service is now hidden from all users globally.",
      });
      fetchServices();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const enabledCount = services.filter((s) => s.is_enabled).length;
  const disabledCount = services.filter((s) => !s.is_enabled).length;

  const filtered = services.filter((s) =>
    !search || s.service_label.toLowerCase().includes(search.toLowerCase()) ||
    s.service_key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Service Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Globally enable or disable services across the entire platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchServices}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-card border border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
          <div className="text-2xl font-heading font-bold text-primary mt-1">{services.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-card border border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Enabled</div>
          <div className="text-2xl font-heading font-bold text-success mt-1">{enabledCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-card border border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Disabled</div>
          <div className="text-2xl font-heading font-bold text-destructive mt-1">{disabledCount}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search services..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className={`transition-all ${!s.is_enabled ? "opacity-60" : ""}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{s.service_label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.service_key}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleService(s)}
                    disabled={toggling === s.service_key}
                    className={s.is_enabled ? "text-success hover:text-success" : "text-destructive hover:text-destructive"}
                  >
                    {s.is_enabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </Button>
                </div>
                <div className="mt-2">
                  <Badge variant={s.is_enabled ? "default" : "destructive"} className="text-[10px]">
                    {s.is_enabled ? "Active" : "Globally Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl border border-dashed border-warning/40 bg-warning/5 text-xs text-muted-foreground">
        <Settings2 className="w-4 h-4 text-warning inline mr-1.5" />
        <strong>Note:</strong> Disabling a service here hides it from <em>all</em> users globally. To disable for a specific user, go to User Management → user actions → Manage Services.
      </div>
    </div>
  );
}
