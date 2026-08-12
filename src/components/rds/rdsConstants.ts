import type { AwsRegion } from "@/services/rdsService";
import type { PsqlPlatform } from "./rdsTypes";

export const EMPTY_VALUE = "—";

export const DEFAULT_RDS_PORT = 5432;
export const DEFAULT_PARAMETER_GROUP = "default.aurora-postgresql17";

/** Regions the express RDS configuration can be provisioned into. */
export const RDS_REGION_OPTIONS: { value: AwsRegion; label: string }[] = [
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-east-1", label: "US East (N. Virginia)" },
];

export const PSQL_PLATFORM_OPTIONS: { value: PsqlPlatform; label: string }[] = [
  { value: "macos", label: "psql (macOS)" },
  { value: "linux", label: "psql (Linux)" },
  { value: "windows", label: "psql (Windows)" },
];

export const RDS_LIST_COLUMNS = [
  "Request ID",
  "DB Identifier",
  "Status",
  "Role",
  "Engine",
  "Upgrade Rollout",
  "Region",
  "Size",
  "Created",
  "Actions",
];

/** Validation bounds for the express create form. */
export const RDS_LIMITS = {
  identifierMaxLength: 63,
  usernameMaxLength: 16,
  minAcu: 0,
  maxAcu: 256,
  minAutoPauseSeconds: 300,
  maxAutoPauseSeconds: 86400,
  justificationMinLength: 20,
  justificationMaxLength: 250,
} as const;

export const CLUSTER_IDENTIFIER_REGEX = /^[a-z][a-z0-9-]*$/;
export const MASTER_USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const DEFAULT_DATABASE_NAME = "postgres";
export const SSL_BUNDLE_URL =
  "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem";
