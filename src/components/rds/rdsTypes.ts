/** Shared RDS domain types used across the RDS pages and components. */

export type RdsEngine =
  | "Aurora MySQL"
  | "Aurora PostgreSQL"
  | "MySQL"
  | "PostgreSQL"
  | "MariaDB"
  | "Oracle"
  | "SQL Server";

export type RdsRole =
  | "Regional cluster"
  | "Writer instance"
  | "Reader instance"
  | "Standalone";

export type RdsStatus =
  | "Available"
  | "Creating"
  | "Deleting"
  | "Stopped"
  | "Modifying"
  | "Provisioning"
  | "Terminating"
  | "Terminated";

/** Flattened cluster/instance row rendered by the RDS list table. */
export interface RdsRow {
  id: string;
  requestId: string;
  dbIdentifier: string;
  status: RdsStatus;
  role: RdsRole;
  engine: RdsEngine;
  engineVersion: string;
  upgradeRollout: string;
  region: string;
  size: string;
  created: string;
  isCluster: boolean;
  clusterId?: string;
}

export type RdsDetailTab = "connectivity" | "configuration";
export type RdsConnectUsing = "code" | "endpoints";
export type PsqlPlatform = "macos" | "linux" | "windows";

export interface RdsConnectivityData {
  endpoint: string;
  internetAccessGateway: string;
  iamAuthentication: string;
  databaseName: string;
  masterUsername: string;
  port: number;
  availabilityZone: string;
  subnets: string[];
  certificateAuthority: string;
  certificateAuthorityDate: string;
}

export interface RdsEndpointRow {
  name: string;
  status: string;
  type: string;
  port: number;
}

export interface RdsConnectionStep {
  label: string;
  code: string;
}

export type RdsCreateField =
  | "identifier"
  | "username"
  | "minCapacity"
  | "maxCapacity"
  | "pauseAfter";

export interface RdsCreateRow {
  config: string;
  value: string | React.ReactNode;
  hint?: string;
  modifiable: string;
  editable?: boolean;
  field?: RdsCreateField;
}
