import type { ServiceQuota } from "./dashboardApi";
import { getQuotaBarPercent, getServiceColor, getServiceIcon } from "./dashboardUtils";

interface ServiceQuotasCardProps {
  quotas: ServiceQuota[];
  isLoading?: boolean;
}

const CARD_TITLE = "Resources by Service";

export function ServiceQuotasCard({
  quotas,
  isLoading = false,
}: ServiceQuotasCardProps) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-sm font-medium mb-4">{CARD_TITLE}</h2>

        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!quotas?.length) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-sm font-medium mb-2">{CARD_TITLE}</h2>
        <p className="text-xs text-muted-foreground">No quota data available.</p>
      </div>
    );
  }

  const maxCount = Math.max(...quotas.map((quota) => quota.current ?? 0), 1);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-6 py-3">
        <h2 className="text-lg font-semibold">{CARD_TITLE}</h2>
      </div>

      <div className="divide-y divide-border">
        {quotas.map((quota) => {
          const current = quota.current ?? 0;
          const label = quota.label || quota.service;
          const ServiceIcon = getServiceIcon(quota.service);
          const color = getServiceColor(label, quota.service);

          return (
            <div
              key={quota.service}
              className="flex items-center gap-4 px-6 py-2"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <ServiceIcon size={20} className="text-muted-foreground" />
              </div>

              <div className="flex flex-1 items-center gap-4">
                <span className="w-20 shrink-0 text-sm font-medium">
                  {label}
                </span>

                <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                    style={{ width: `${getQuotaBarPercent(current, maxCount)}%` }}
                  />
                </div>
              </div>

              <div className="w-8 text-right text-lg font-semibold">
                {current}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
