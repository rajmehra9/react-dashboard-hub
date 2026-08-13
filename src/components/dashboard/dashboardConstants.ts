/**
 * dashboardConstants.ts
 * Static configuration used across the dashboard page.
 */

import {
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  EC2Icon,
  EKSIcon,
  LBIcon,
  RDSIcon,
  Route53Icon,
  S3Icon,
  VPCIcon,
} from "@/components/icons/aws-icons";
import type { RequestStatusStyle } from "./dashboardTypes";

export const RECENT_REQUESTS_LIMIT = 5;

export const STAKEHOLDER_ROLE = "SplunkOps.Stakeholder";

export const SERVICE_ICONS = {
  ec2: EC2Icon,
  vpc: VPCIcon,
  lb: LBIcon,
  s3: S3Icon,
  rds: RDSIcon,
  route53: Route53Icon,
  eks: EKSIcon,
} as const;

export const DEFAULT_SERVICE_ICON = EC2Icon;

export const SERVICE_COLORS: Record<string, string> = {
  EC2: "#3B82F6",
  VPC: "#8B5CF6",
  LB: "#F97316",
  "Load Balancers": "#F97316",
  S3: "#10B981",
  RDS: "#06B6D4",
  Route53: "#EC4899",
  "Route 53": "#EC4899",
  EKS: "#FACC15",
};

export const DEFAULT_SERVICE_COLOR = "#3B82F6";

export const STAT_CARD_STYLES = {
  primary: {
    bg: "bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent",
    card:
      "hover:border-blue-500/40 hover:shadow-[0_20px_45px_rgba(37,99,235,.1)] card-bg1",
    icon: "text-primary bg-primary/10",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent",
    card:
      "hover:border-amber-500/40 hover:shadow-[0_20px_45px_rgba(245,158,11,.1)] card-bg3",
    icon: "text-warning bg-warning/10",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent",
    card:
      "hover:border-emerald-500/40 hover:shadow-[0_20px_45px_rgba(16,185,129,.1)] card-bg2",
    icon: "text-success bg-success/10",
  },
  destructive: {
    bg: "bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent",
    card: "hover:border-red-500/40 hover:shadow-[0_20px_45px_rgba(239,68,68,.1)]",
    icon: "text-destructive bg-destructive/10",
  },
  default: {
    bg: "bg-card",
    card: "hover:border-primary/30 card-bg4",
    icon: "text-muted-foreground bg-muted",
  },
} as const;

const SPINNING_ICON = Loader2;

export const REQUEST_STATUS_STYLES: Record<string, RequestStatusStyle> = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Pending",
  },
  running: {
    icon: SPINNING_ICON,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Running",
    animate: true,
  },
  provisioning: {
    icon: SPINNING_ICON,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Running",
    animate: true,
  },
  starting: {
    icon: SPINNING_ICON,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Starting",
    animate: true,
  },
  stopping: {
    icon: SPINNING_ICON,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Stopping",
    animate: true,
  },
  terminating: {
    icon: SPINNING_ICON,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Terminating",
    animate: true,
  },
  terminated: {
    icon: SPINNING_ICON,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Terminated",
    animate: true,
  },
  stopped: {
    icon: PauseCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Stopped",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Failed",
  },
  destroyed: {
    icon: Trash2,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Terminated",
  },
  destroying: {
    icon: Trash2,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    label: "Terminating",
    animate: true,
  },
  retrying: {
    icon: SPINNING_ICON,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Retrying",
    animate: true,
  },
  retrying_terminate: {
    icon: SPINNING_ICON,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Retrying",
    animate: true,
  },
  retrying_provision: {
    icon: SPINNING_ICON,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Retrying",
    animate: true,
  },
};

export const DEFAULT_REQUEST_STATUS_STYLE: RequestStatusStyle = {
  icon: Clock,
  color: "text-muted-foreground",
  bg: "bg-muted",
  label: "Unknown",
  animate: false,
};
