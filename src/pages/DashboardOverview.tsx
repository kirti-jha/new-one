import { useAuth } from "@/contexts/AuthContext";
import AdminOverview from "@/components/dashboards/AdminOverview";
import SuperDistributorOverview from "@/components/dashboards/SuperDistributorOverview";
import MasterDistributorOverview from "@/components/dashboards/MasterDistributorOverview";
import DistributorOverview from "@/components/dashboards/DistributorOverview";
import RetailerOverview from "@/components/dashboards/RetailerOverview";

export default function DashboardOverview() {
  const { role, profile } = useAuth();
  const name = profile?.full_name || "User";

  switch (role) {
    case "admin":
      return <AdminOverview name={name} />;
    case "super_distributor":
      return <SuperDistributorOverview name={name} />;
    case "master_distributor":
      return <MasterDistributorOverview name={name} />;
    case "distributor":
      return <DistributorOverview name={name} />;
    case "retailer":
      return <RetailerOverview name={name} />;
    default:
      return (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      );
  }
}
