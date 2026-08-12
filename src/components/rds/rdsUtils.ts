import type { RdsClusterApi, RdsInstanceApi } from "@/services/rdsService";
import {
  CLUSTER_IDENTIFIER_REGEX,
  DEFAULT_RDS_PORT,
  EMPTY_VALUE,
  MASTER_USERNAME_REGEX,
  RDS_LIMITS,
  SSL_BUNDLE_URL,
} from "./rdsConstants";
import type {
  PsqlPlatform,
  RdsConnectionStep,
  RdsConnectivityData,
  RdsCreateField,
  RdsEndpointRow,
  RdsEngine,
  RdsRow,
  RdsStatus,
} from "./rdsTypes";

/** "05 Aug 2026" style date label. */
export function formatRdsDate(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month} ${date.getFullYear()}`;
}

export function formatRdsDateTime(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : date.toLocaleString();
}

/** "4 ACU (8 GiB)" label used by the create form. */
export function formatAcu(value: string | number): string {
  const acu = Number(value) || 0;
  const gib = acu === 0 ? 0 : Math.round(acu * 2);
  return `${acu} ACU (${gib} GiB)`;
}

/** "5:00:00" style idle-time label from a seconds value. */
export function formatIdleTime(seconds?: number | null): string {
  if (!seconds) return EMPTY_VALUE;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}:00`;
}

export function normaliseEngine(engine: string): RdsEngine {
  const value = (engine ?? "").toLowerCase();
  if (value.includes("aurora") && value.includes("mysql")) return "Aurora MySQL";
  if (value.includes("aurora") && value.includes("postgres")) return "Aurora PostgreSQL";
  if (value.includes("mysql")) return "MySQL";
  if (value.includes("postgres")) return "PostgreSQL";
  if (value.includes("mariadb")) return "MariaDB";
  if (value.includes("oracle")) return "Oracle";
  if (value.includes("sqlserver") || value.includes("sql server")) return "SQL Server";
  return "PostgreSQL";
}

export function normaliseStatus(status: string): RdsStatus {
  switch ((status ?? "").toLowerCase()) {
    case "creating":
    case "provisioning":
      return "Provisioning";
    case "deleting":
    case "destroying":
      return "Terminating";
    case "stopped":
      return "Stopped";
    case "modifying":
      return "Modifying";
    case "deleted":
    case "destroyed":
      return "Terminated";
    default:
      return "Available";
  }
}

export function isProvisioningStatus(status?: string | null): boolean {
  const value = (status ?? "").toLowerCase();
  return value === "provisioning" || value === "creating";
}

/** Flatten an API cluster into its list row plus one row per instance. */
export function clusterToRows(cluster: RdsClusterApi): RdsRow[] {
  const instances = cluster.instances ?? [];

  const clusterRow: RdsRow = {
    id: cluster.request_id,
    requestId: cluster.request_id,
    dbIdentifier: cluster.cluster_identifier,
    status: normaliseStatus(cluster.cluster_status),
    role: "Regional cluster",
    engine: normaliseEngine(cluster.engine),
    engineVersion: cluster.engine_version,
    upgradeRollout: cluster.upgrade_rollout_order ?? EMPTY_VALUE,
    region: cluster.region,
    size: `${instances.length} ${instances.length === 1 ? "Instance" : "Instances"}`,
    created: formatRdsDate(cluster.cluster_created_at),
    isCluster: true,
  };

  const instanceRows: RdsRow[] = instances.map((instance) => ({
    id: `${cluster.request_id}__${instance.instance_identifier}`,
    requestId: cluster.request_id,
    dbIdentifier: instance.instance_identifier,
    status: normaliseStatus(instance.status),
    role: instance.instance_role === "WRITER" ? "Writer instance" : "Reader instance",
    engine: normaliseEngine(cluster.engine),
    engineVersion: instance.engine_version ?? cluster.engine_version,
    upgradeRollout: instance.upgrade_rollout_order ?? EMPTY_VALUE,
    region: instance.availability_zone ?? cluster.region,
    size: instance.instance_class,
    created: formatRdsDate(instance.created_at),
    isCluster: false,
    clusterId: cluster.request_id,
  }));

  return [clusterRow, ...instanceRows];
}

/** Case-insensitive match against the searchable row fields. */
export function matchesRdsQuery(row: RdsRow, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return [row.dbIdentifier, row.engine, row.region, row.status].some((value) =>
    value?.toLowerCase().includes(term),
  );
}

/** Connectivity panel data for either a cluster or one of its instances. */
export function buildConnectivityData(
  cluster: RdsClusterApi,
  instance: RdsInstanceApi | null,
): RdsConnectivityData {
  const primaryInstance = cluster.instances?.[0] ?? null;
  const source = instance ?? primaryInstance;

  return {
    endpoint: (instance ? instance.endpoint : cluster.endpoint) ?? "",
    internetAccessGateway: source?.publicly_accessible ? "Public" : "Private",
    iamAuthentication: cluster.iam_auth_enabled ? "Enabled" : "Disabled",
    databaseName: cluster.database_name ?? "",
    masterUsername: cluster.master_username ?? "",
    port: (instance?.port ?? cluster.port ?? DEFAULT_RDS_PORT) as number,
    availabilityZone: source?.availability_zone ?? EMPTY_VALUE,
    subnets: instance
      ? (Array.isArray(instance.subnets_json)
          ? instance.subnets_json.map((subnet: any) =>
              typeof subnet === "string" ? subnet : subnet?.SubnetIdentifier ?? "",
            ).filter(Boolean)
          : [])
      : primaryInstance?.availability_zone
        ? [primaryInstance.availability_zone]
        : [],
    certificateAuthority: source?.ca_certificate_identifier ?? "",
    certificateAuthorityDate:
      (instance ? instance.ca_certificate_expiry : cluster.created_at) ?? "",
  };
}

export function buildClusterEndpoints(cluster: RdsClusterApi): RdsEndpointRow[] {
  const port = (cluster.port ?? DEFAULT_RDS_PORT) as number;

  return [
    { name: cluster.endpoint ?? "", status: "Available", type: "Writer", port },
    { name: cluster.reader_endpoint ?? "", status: "Available", type: "Reader", port },
  ].filter((endpoint) => endpoint.name);
}

/** Sample IAM authentication token shown in the "Get token" dialog. */
export function buildAuthTokenPreview(data: RdsConnectivityData): string {
  return `${data.endpoint}:${data.port}/?Action=connect&DBUser=${data.masterUsername}&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE&X-Amz-Date=20260707T000000Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=abcdef1234567890abcdef1234567890abcdef12`;
}

export interface ConnectionStepParams {
  platform: PsqlPlatform;
  endpoint: string;
  masterUsername: string;
  databaseName: string;
  port: number;
  secretArn: string;
  region: string;
}

/** psql connection snippets for the selected platform. */
export function getConnectionSteps({
  platform,
  endpoint,
  masterUsername,
  databaseName,
  port,
  secretArn,
  region,
}: ConnectionStepParams): RdsConnectionStep[] {
  const downloadCert: RdsConnectionStep = {
    label: "Download SSL certificate",
    code: `curl -o global-bundle.pem ${SSL_BUNDLE_URL}`,
  };

  if (platform === "windows") {
    return [
      downloadCert,
      {
        label: "Connect using psql",
        code: `psql "host=${endpoint} port=${port} dbname=${databaseName} user=${masterUsername} sslmode=verify-full sslrootcert=./global-bundle.pem password=$( ($s = aws secretsmanager get-secret-value --secret-id ${secretArn} --region ${region} | ConvertFrom-Json).SecretString | ConvertFrom-Json | Select-Object -ExpandProperty password )"`,
      },
    ];
  }

  return [
    downloadCert,
    { label: "Set host variable", code: `export RDSHOST="${endpoint}"` },
    {
      label: "Connect using psql",
      code: `psql "host=$RDSHOST port=${port} dbname=${databaseName} user=${masterUsername} sslmode=verify-full sslrootcert=./global-bundle.pem password=$(aws secretsmanager get-secret-value --secret-id '${secretArn}' --region ${region} --query SecretString --output text | jq -r '.password')"`,
    },
  ];
}

/** Field-level validation messages for the express create form. */
export function validateRdsForm(values: {
  identifier: string;
  username: string;
  minCapacity: string;
  maxCapacity: string;
  pauseAfter: string;
}): Record<RdsCreateField, string> {
  const { identifier, username, minCapacity, maxCapacity, pauseAfter } = values;

  return {
    identifier: !identifier.trim()
      ? "The DB cluster identifier field is required."
      : identifier.length > RDS_LIMITS.identifierMaxLength
        ? `Cluster identifier must be ${RDS_LIMITS.identifierMaxLength} characters or less.`
        : !CLUSTER_IDENTIFIER_REGEX.test(identifier)
          ? "Must start with a letter, contain only lowercase letters, numbers, hyphens"
          : "",
    username: !username.trim()
      ? "The Database master username field is required."
      : username.length > RDS_LIMITS.usernameMaxLength
        ? `Master username must be ${RDS_LIMITS.usernameMaxLength} characters or less.`
        : !MASTER_USERNAME_REGEX.test(username)
          ? "Must start with a letter, contain only letters, numbers, underscores"
          : "",
    minCapacity: !minCapacity.trim()
      ? "The minimum capacity (ACUs) field is required."
      : Number(minCapacity) < RDS_LIMITS.minAcu || Number(minCapacity) > RDS_LIMITS.maxAcu
        ? `Min capacity must be between ${RDS_LIMITS.minAcu} and ${RDS_LIMITS.maxAcu}.`
        : "",
    maxCapacity: !maxCapacity.trim()
      ? "The maximum capacity (ACUs) field is required."
      : Number(maxCapacity) < 1 || Number(maxCapacity) > RDS_LIMITS.maxAcu
        ? `Max capacity must be between 1 and ${RDS_LIMITS.maxAcu}.`
        : Number(maxCapacity) < Number(minCapacity)
          ? "Max capacity must be greater than or equal to min capacity."
          : "",
    pauseAfter: !pauseAfter.trim()
      ? "The pause after inactivity field is required."
      : Number(pauseAfter) < RDS_LIMITS.minAutoPauseSeconds ||
          Number(pauseAfter) > RDS_LIMITS.maxAutoPauseSeconds
        ? `Value must be between ${RDS_LIMITS.minAutoPauseSeconds} and ${RDS_LIMITS.maxAutoPauseSeconds} seconds.`
        : "",
  };
}

export function isJustificationValid(justification: string): boolean {
  return justification.trim().length >= RDS_LIMITS.justificationMinLength;
}
