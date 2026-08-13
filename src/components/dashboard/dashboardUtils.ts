/**
 * dashboardUtils.ts
 * Pure helpers for formatting and resolving dashboard presentation data.
 */

import {
  DEFAULT_REQUEST_STATUS_STYLE,
  DEFAULT_SERVICE_COLOR,
  DEFAULT_SERVICE_ICON,
  REQUEST_STATUS_STYLES,
  SERVICE_COLORS,
  SERVICE_ICONS,
} from "./dashboardConstants";
import type { RequestStatusStyle, ResourceTrend } from "./dashboardTypes";

export function getServiceIcon(service?: string) {
  const key = service?.toLowerCase() as keyof typeof SERVICE_ICONS;
  return SERVICE_ICONS[key] ?? DEFAULT_SERVICE_ICON;
}

export function getServiceColor(label?: string, service?: string) {
  return (
    (label ? SERVICE_COLORS[label] : undefined) ??
    (service ? SERVICE_COLORS[service] : undefined) ??
    DEFAULT_SERVICE_COLOR
  );
}

export function getRequestStatusStyle(status?: string): RequestStatusStyle {
  return REQUEST_STATUS_STYLES[status ?? ""] ?? DEFAULT_REQUEST_STATUS_STYLE;
}

export function getRequestStatusLabel(status?: string) {
  const known = REQUEST_STATUS_STYLES[status ?? ""];
  if (known) return known.label;
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Normalizes a trend payload into display/tooltip strings. */
export function formatTrend(trend?: ResourceTrend) {
  if (!trend) return null;

  const absValue = Math.abs(Number(trend.value ?? 0));
  const overHundred = absValue > 100;

  return {
    positive: trend.positive,
    displayText: overHundred ? "100%+" : `${absValue.toFixed(2)}%`,
    tooltipText: `${absValue.toFixed(2)}%`,
    showTooltip: overHundred,
  };
}

/** Clamps a bar width so tiny values remain visible. */
export function getQuotaBarPercent(current: number, maxCount: number) {
  return Math.max((current / Math.max(maxCount, 1)) * 100, 2);
}
