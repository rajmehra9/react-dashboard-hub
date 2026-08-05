import { useEffect, useState } from "react";
import { RefreshCw, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Network, Layers, Globe, Clock, Monitor, ArrowUpCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { fetchRoute53Records, Route53RecordItem } from "@/services/route53Api";
import { Route53QuotaIncreaseDialog } from "@/components/route-53/Route53QuotaIncreaseDialog";
import { env } from "@/lib/env";
import { getClientIp } from "@/utils/getClientIP";
import { useAppStore } from "@/store/appStore";
import { useDialog } from "@/components/ui/dialog-context";

type HostedZone = {
  id: string;
  name: string;
  type: string;
  createdBy: string;
  records: number;
  description: string;
};

const data: HostedZone[] = [
  { id: "Z27YR27SJSDXLT", name: "prusplunk.com", type: "Public", createdBy: "Route 53", records: 28, description: "Hosted zone created by Route53 Registrar" },
  // { id: "Z00619881JSGUIVHB25XT", name: "galt.net", type: "Public", createdBy: "Route 53", records: 3, description: "-" },
];

function isIPv4Address(value: string): boolean {
  return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(value.trim());
}

function recordHasIPv4Value(record: Route53RecordItem): boolean {
  if (record.is_alias || !record.value) return false;
  try {
    const parsed = JSON.parse(record.value);
    if (Array.isArray(parsed)) {
      return parsed.some((v) => isIPv4Address(String(v)));
    }
  } catch {
    // plain string value — fall through
  }
  return isIPv4Address(record.value);
}

export default function Route53() {
  const currentUser = useAppStore((s) => s.currentUser);
  const { alert } = useDialog();
  const MAX_RECORDS = currentUser?.maxDnsRecords ?? 0;
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const MAX_HOSTED_ZONES = 20;
  const [requestedQuota, setRequestedQuota] = useState(0);
  const [reason, setReason] = useState("");
  const [submitQuota, setSubmitQuota] = useState(false);
  const [quotaError, setQuotaError] = useState("");
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");

  const [records, setRecords] = useState<Route53RecordItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchRoute53Records();
        if (!cancelled) setRecords(all);
      } catch (err) {
        console.error("Failed to load Route53 records for stats:", err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const aliasRecordsCount = records.filter((r) => r.is_alias).length;
  // after aliasRecordsCount / ipRecordsCount
const recordCountByZoneName = (zoneName: string) =>
  records.filter((r) => r.hosted_zone_name === zoneName).length;
  const ipRecordsCount = records.filter(recordHasIPv4Value).length;

  const [usedRecords, setUsedRecords] = useState(0);
  const rows = data.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
  const totalRecords = usedRecords;
  const remainingQuota = Math.max(
    0,
    MAX_RECORDS - totalRecords
  ); console.log({
    maxDnsRecords: currentUser?.maxDnsRecords,
    totalRecords,
    remainingQuota,
  });
  const fetchQuotaUsage = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${env.route53Service}/quota`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log("Quota API:", result);

      setUsedRecords(result.usedRecords || 0);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchQuotaUsage();
  }, []);
  const hasReachedQuota = usedRecords >= MAX_RECORDS;
  return (
    <div>
      <Header
        title="Hosted zones (2)"
        subtitle="Automatic mode is the current search behavior optimized for best filter results."
        showSearch={false}
      />
      <div className="space-y-4 p-6">
        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <StatCard
            icon={<Globe className="h-4 w-4 text-primary" />}
            iconBg="bg-primary/10"
            value="1"
            label="Hosted Zones"
          />

          <StatCard
            icon={<Network className="h-4 w-4 text-cyan-400" />}
            iconBg="bg-cyan-500/10"
            value={statsLoading ? "-" : aliasRecordsCount}
            label="Alias Records"
          />

          <StatCard
            icon={<Layers className="h-4 w-4 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
            value={statsLoading ? "-" : ipRecordsCount}
            label="IP Records"
          />

          {/* <StatCard
            icon={<Clock className="h-4 w-4 text-amber-400" />}
            iconBg="bg-amber-500/10"
            value="3"
            label="Failed Requests"
          /> */}
          <div className="flex-auto w-full sm:w-auto max-w-full sm:max-w-[400px] min-w-[220px] flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur px-4 py-3 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground leading-tight">
                  {remainingQuota}
                </p>

                <p className="text-xs text-muted-foreground">
                  Records Remaining
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-primary text-primary bg-primary/10 text-xs whitespace-nowrap hover:bg-primary hover:text-white"
              onClick={() => setShowQuotaDialog(true)}
            >
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
              Request Increase
            </Button>
          </div>
        </div>

        {/* Search & Actions */}
        <Card className="sticky top-16 z-30 glass-panel backdrop-blur border-border/50 p-0">
          <CardContent className="py-0 px-0">
            <div className="flex items-center gap-3 p-4 px-6">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Filter records by property or value..."
              className="pl-9 bg-background/50"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => alert({ title: "Refreshed", severity: "success" })}
          >
            <RefreshCw size={14} />
          </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border/50">
                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Hosted Zone Name
                  </th>

                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Created By
                  </th>

                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Record Count
                  </th>

                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Description
                  </th>

                  <th className="px-5 py-3 text-left font-medium whitespace-nowrap">
                    Hosted Zone ID
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      to="/aws/hostedzonedetails"
                      className="font-medium text-primary hover:underline"
                    >
                      prusplunk.com
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    Public
                  </td>

                  <td className="px-5 py-4">
                    Route 53
                  </td>

                  <td className="px-5 py-4">
                   {statsLoading ? "-" : recordCountByZoneName("prusplunk.com")}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    Hosted zone created by Route53 Registrar
                  </td>

                  <td className="px-5 py-4 font-mono text-muted-foreground">
                    Z27YR27SJSDXLT
                  </td>
                </tr>

                <tr className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Route53QuotaIncreaseDialog
        open={showQuotaDialog}
        onOpenChange={setShowQuotaDialog}
        currentMaxRecords={MAX_RECORDS}
        usedRecords={totalRecords}
        requestedquota={requestedQuota}
        setrequestedquota={setRequestedQuota}
        reason={reason}
        setreason={setReason}
        submitquota={submitQuota}
        quotaError={quotaError}
        setQuotaError={setQuotaError}
        touched={touched}
        setTouched={setTouched}
        isMAxREached={hasReachedQuota}
        onSubmit={async (approverEmail) => {
          try {
            setSubmitQuota(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
              `${env.vmRequest}/api/route53-quota/${currentUser?.id}/request`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  "x-client-ip": (await getClientIp()) || "",
                },
                body: JSON.stringify({
                  requestedQuota: requestedQuota - MAX_RECORDS,
                  reason,
                  approverEmail,
                }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data?.message ||
                data?.error ||
                "Failed to submit Route53 quota request"
              );
            }

            alert({
              title: "Route53 quota request submitted successfully",
              severity: "success",
            });

            setShowQuotaDialog(false);
            setRequestedQuota(0);
            setReason("");
            setTouched(false);
            setQuotaError("");

          } catch (error: any) {
            alert({
              title:
                error?.message ||
                "Failed to submit Route53 quota request",
              severity: "error",
            });
          } finally {
            setSubmitQuota(false);
          }
        }}
      />
    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex-1 min-w-[140px] flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur px-4 py-3 hover:border-primary/30 transition-colors">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}