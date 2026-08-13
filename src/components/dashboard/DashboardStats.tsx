import { Activity, Clock, Server, Users } from "lucide-react";
import { StatCard } from "./StatCard";
import type { DashboardStatsProps } from "./dashboardTypes";

export function DashboardStats({
  totalResources,
  activeResources,
  provisioningCount,
  avgProvisionTime,
  trend,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        title="Active Resources"
        value={totalResources}
        subtitle="Across all services & regions"
        icon={Server}
        variant="primary"
        trend={trend}
      />

      <StatCard
        title="Running Operations"
        value={provisioningCount}
        subtitle="Automation in progress"
        icon={Activity}
        variant="warning"
      />

      <StatCard
        title="Active Users"
        value={activeResources}
        subtitle="With active services"
        icon={Users}
        variant="success"
      />

      <StatCard
        title="Avg. Provision Time"
        value={avgProvisionTime}
        subtitle="Last 7 days"
        icon={Clock}
      />
    </div>
  );
}
