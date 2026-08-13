/**
 * dashboardTypes.ts
 * Shared type definitions for the dashboard page.
 */

import type { LucideIcon } from "lucide-react";

export type StatCardVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive";

export interface ResourceTrend {
  value?: number;
  display?: string;
  tooltip?: string;
  positive: boolean;
  showTooltip?: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: ResourceTrend;
  variant?: StatCardVariant;
}

export interface DashboardStatsProps {
  totalResources: number;
  activeResources: number;
  provisioningCount: number;
  avgProvisionTime: string;
  trend?: ResourceTrend;
}

export interface RecentRequest {
  request_id: string;
  user_name: string;
  action: string;
  region: string;
  project: string;
  environment: string;
  category: number | string;
  categoryLabel?: string;
  total_vms: number;
  status: string;
  created_at: string;
  updated_at?: string;
  vm_count: number;
  logs_cleared_at: string | null;
  service?: string;
}

export interface RequestStatusStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
  animate?: boolean;
}
