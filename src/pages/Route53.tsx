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
  const refreshCurrentUser = useAppStore(
    (s) => s.refreshCurrentUser
  );
  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);
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
  const query = search.trim().toLowerCase();
  const rows = data.filter((x) =>
    !query ||
    [x.name, x.type, x.id, x.createdBy].some((f) =>
      f.toLowerCase().includes(query)
    )
  );
  const query = search.trim().toLowerCase();
  const rows = data.filter((x) =>
    !query ||
    [x.name, x.type, x.id, x.createdBy].some((f) =>
      f.toLowerCase().includes(query)
    )
  );
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
  const MAX_ROUTE53_QUOTA = 10;
  const hasReachedSystemLimit =
    MAX_RECORDS >= MAX_ROUTE53_QUOTA;
  return (
    <div>
      <Header
        title="Hosted zones"
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <svg width={16} height={16} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="#EC4899" fillRule="evenodd" clipRule="evenodd" d="M14.4147 11.267C14.705 11.5354 14.8504 11.895 14.8504 12.3465C14.8504 12.8378 14.6736 13.23 14.3204 13.5232C13.9669 13.8168 13.4919 13.9634 12.8959 13.9634C12.4249 13.9634 11.9586 13.8628 11.4974 13.6623V13.0606C12.0438 13.2414 12.5098 13.3314 12.8959 13.3314C13.277 13.3314 13.5701 13.2461 13.7755 13.076C13.981 12.9054 14.0835 12.6621 14.0835 12.3465C14.0835 11.7397 13.7005 11.4363 12.9333 11.4363C12.6928 11.4363 12.4548 11.4489 12.219 11.4737V10.9777L13.7983 9.25513H11.5728V8.63851H14.6328V9.23274L13.0837 10.8724C13.1093 10.8673 13.1336 10.8649 13.1591 10.8649H13.2342C13.7308 10.8649 14.124 10.9989 14.4147 11.267ZM10.0469 11.1357C10.3522 11.4214 10.505 11.8148 10.505 12.3159C10.505 12.8075 10.3274 13.2049 9.97111 13.5083C9.61518 13.8117 9.14689 13.9634 8.56546 13.9634C8.05475 13.9634 7.57586 13.8628 7.12957 13.6623V13.0606C7.68586 13.2414 8.162 13.3314 8.558 13.3314C8.93907 13.3314 9.23096 13.2454 9.43368 13.072C9.63679 12.8991 9.73854 12.6499 9.73854 12.3237C9.73854 11.9677 9.64307 11.7095 9.45254 11.5491C9.262 11.3888 8.95125 11.3082 8.52029 11.3082C8.20954 11.3082 7.82139 11.3338 7.35507 11.3837V10.8873L7.49807 8.63851H10.2422V9.25513H8.12939L8.03157 10.782C8.30736 10.7321 8.55525 10.7069 8.77564 10.7069C9.317 10.7069 9.74089 10.8496 10.0469 11.1357ZM15.6974 16.6484C13.7905 16.9911 12.1204 17.7677 11 18.4004C9.87918 17.7677 8.20914 16.9911 6.30261 16.6484C5.76596 16.5521 3.09139 15.9937 3.09139 14.4476C3.09139 13.7311 3.34793 13.256 3.84057 12.4074C4.42907 11.3927 5.16136 10.1296 5.16136 8.31112C5.16136 7.01145 4.82075 5.76523 4.14818 4.60232C4.22714 4.50486 4.30768 4.4062 4.38861 4.30678C5.38489 4.80472 6.42204 5.05704 7.47646 5.05704C8.76504 5.05704 9.94911 4.71865 11 4.05093C12.0505 4.71865 13.2346 5.05704 14.5231 5.05704C15.5776 5.05704 16.6151 4.80472 17.6114 4.30678C17.6919 4.4062 17.7725 4.50486 17.8514 4.60232C17.1789 5.76523 16.8382 7.01145 16.8382 8.31112C16.8382 10.1296 17.5705 11.3927 18.1602 12.409C18.6517 13.256 18.9082 13.7311 18.9082 14.4476C18.9082 15.9937 16.2336 16.5521 15.6974 16.6484ZM17.624 8.31112C17.624 7.0704 17.974 5.88117 18.6635 4.77643C18.753 4.63375 18.7416 4.45023 18.6348 4.31975C18.4352 4.07528 18.2258 3.81786 18.0192 3.56203C17.8994 3.41387 17.6911 3.37299 17.5238 3.46494C16.5562 3.99983 15.5469 4.27101 14.5231 4.27101C13.288 4.27101 12.2088 3.93891 11.2235 3.25626C11.0892 3.16312 10.9104 3.16312 10.7761 3.25626C9.79079 3.93891 8.71161 4.27101 7.47646 4.27101C6.45268 4.27101 5.44343 3.99983 4.47582 3.46494C4.30886 3.37299 4.10025 3.41387 3.98043 3.56203C3.77379 3.81786 3.56439 4.07528 3.36482 4.31975C3.25836 4.45023 3.24657 4.63375 3.33614 4.77643C4.026 5.88117 4.37564 7.0704 4.37564 8.31112C4.37564 9.91815 3.70189 11.0795 3.16054 12.0141C2.63018 12.9266 2.30568 13.5326 2.30568 14.4476C2.30568 16.5647 5.25839 17.2599 6.16354 17.4222C8.07282 17.7653 9.74011 18.5745 10.8024 19.1927C10.8633 19.2285 10.9316 19.2462 11 19.2462C11.068 19.2462 11.1363 19.2285 11.1976 19.1927C12.2599 18.5745 13.9268 17.7653 15.8361 17.4222C16.7412 17.2599 19.6939 16.5647 19.6939 14.4476C19.6939 13.5326 19.3694 12.9266 18.8391 12.0129C18.2977 11.0795 17.624 9.91815 17.624 8.31112ZM16.1048 18.9188C13.6962 19.3519 11.6769 20.6473 11 21.1216C10.3227 20.6473 8.30343 19.3519 5.89482 18.9188C1.15382 18.0672 0.785714 15.2811 0.785714 14.4476C0.785714 13.0764 1.32432 12.1485 1.84525 11.2504C2.34182 10.3949 2.85529 9.50981 2.85529 8.31112C2.85529 6.41763 1.76196 5.08021 1.22257 4.5359C1.78986 3.84578 3.223 2.09845 3.92975 1.18786C5.00068 2.19868 6.24564 2.75007 7.47646 2.75007C8.84282 2.75007 9.97268 2.19397 11 1.00746C12.0269 2.19397 13.1568 2.75007 14.5231 2.75007C15.754 2.75007 16.9989 2.19868 18.0703 1.18786C18.777 2.09845 20.2098 3.84578 20.777 4.5359C20.2376 5.08021 19.1443 6.41763 19.1443 8.31112C19.1443 9.50981 19.6582 10.3949 20.1544 11.2504C20.6757 12.1485 21.2143 13.0764 21.2143 14.4476C21.2143 15.2811 20.8458 18.0672 16.1048 18.9188ZM20.834 10.8563C20.3488 10.0199 19.93 9.29798 19.93 8.31112C19.93 6.23369 21.5472 4.88999 21.5629 4.87742C21.6441 4.81139 21.6959 4.71551 21.7069 4.61096C21.7171 4.50643 21.6857 4.40227 21.6189 4.32132C21.5925 4.28986 19.0174 1.16783 18.4274 0.359013C18.3582 0.264282 18.251 0.205353 18.1339 0.198255C18.0164 0.189613 17.9033 0.236389 17.8231 0.322058C16.8331 1.38083 15.6616 1.96404 14.5231 1.96404C13.2644 1.96404 12.2744 1.40323 11.3119 0.145613C11.163 -0.0485375 10.837 -0.0485375 10.6881 0.145613C9.72518 1.40323 8.73518 1.96404 7.47646 1.96404C6.33796 1.96404 5.16646 1.38083 4.17646 0.322058C4.09632 0.236389 3.98239 0.187648 3.86571 0.198255C3.74904 0.205353 3.64139 0.264282 3.57225 0.359013C2.98218 1.16783 0.407 4.28986 0.380679 4.32132C0.314286 4.40227 0.282857 4.50643 0.293464 4.61057C0.303679 4.71473 0.355143 4.81061 0.436072 4.87664C0.452572 4.88999 2.06957 6.23369 2.06957 8.31112C2.06957 9.29798 1.65079 10.0199 1.16561 10.8563C0.619143 11.7979 0 12.8649 0 14.4476C0 17.0843 2.15168 19.045 5.75614 19.6926C8.46961 20.1804 10.7384 21.9013 10.7608 21.9191C10.8311 21.9728 10.9155 22 11 22C11.0841 22 11.1685 21.9728 11.2393 21.9185C11.262 21.9013 13.5229 20.1815 16.2435 19.6926C19.8479 19.045 22 17.0843 22 14.4476C22 12.8649 21.3805 11.7979 20.834 10.8563Z" fill="#EC4899" />
                </svg>
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
              placeholder="Search by hosted zone name, type, or id..."
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full shrink-0"
                onClick={async () => {
                  await Promise.all([
                    fetchQuotaUsage(),
                    refreshCurrentUser(),
                  ]);

                  alert({
                    title: "Refreshed",
                    severity: "success",
                  });
                }}
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
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      No hosted zones found.
                    </td>
                  </tr>
                ) : (
                  rows.map((zone) => (
                    <tr
                      key={zone.id}
                      className="border-b border-border/40 hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          to="/aws/hostedzonedetails"
                          className="font-medium text-primary hover:underline"
                        >
                          {zone.name}
                        </Link>
                      </td>

                      <td className="px-5 py-4">{zone.type}</td>
                      <td className="px-5 py-4">{zone.type}</td>

                      <td className="px-5 py-4">{zone.createdBy}</td>
                      <td className="px-5 py-4">{zone.createdBy}</td>

                      <td className="px-5 py-4">
                        {statsLoading ? "-" : recordCountByZoneName(zone.name)}
                      </td>
                      <td className="px-5 py-4">
                        {statsLoading ? "-" : recordCountByZoneName(zone.name)}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {zone.description}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {zone.description}
                      </td>

                      <td className="px-5 py-4 font-mono text-muted-foreground">
                        {zone.id}
                      </td>
                    </tr>
                  ))
                )}
                      <td className="px-5 py-4 font-mono text-muted-foreground">
                        {zone.id}
                      </td>
                    </tr>
                  ))
                )}
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
        isMAxREached={hasReachedSystemLimit}
        onSubmit={async (approverEmail) => {
          try {
            setSubmitQuota(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
              `${env.route53Service}/route53-quota/${currentUser?.id}/request`,
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