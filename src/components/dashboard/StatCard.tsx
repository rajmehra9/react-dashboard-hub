import { cn } from "@/lib/utils";
import { STAT_CARD_STYLES } from "./dashboardConstants";
import { formatTrend } from "./dashboardUtils";
import type { StatCardProps } from "./dashboardTypes";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const style = STAT_CARD_STYLES[variant] ?? STAT_CARD_STYLES.default;
  const trendInfo = formatTrend(trend);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-border bg-card p-6",
        "backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1",
        style.bg,
        style.card
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-normal text-sm">{title}</p>

          <p
            className={cn(
              "mt-2 text-3xl font-medium",
              variant === "success" && "text-success",
              variant === "warning" && "text-warning"
            )}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
          )}

          {trendInfo && (
            <div className="relative group inline-block">
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                <span
                  className={cn(
                    "cursor-default",
                    trendInfo.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {trendInfo.positive ? "↓" : "↑"} {trendInfo.displayText}
                </span>
                <span> from last 7 days</span>
              </p>

              {trendInfo.showTooltip && (
                <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-sm whitespace-nowrap">
                    {trendInfo.tooltipText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn("rounded-lg p-3", style.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
