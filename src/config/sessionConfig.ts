// ── Session timing configuration ──────────────────────────────────────────────
// All values are in milliseconds. Override with Vite env vars (seconds) to test
// short cycles without touching code, e.g. in .env:
//   VITE_SESSION_MAX_SECONDS=60
//   VITE_SESSION_IDLE_SECONDS=30
//   VITE_SESSION_REFRESH_LEAD_SECONDS=10

function secondsFromEnv(key: string): number | null {
  const raw = (import.meta as any).env?.[key];
  const value = Number(raw);
  return raw !== undefined && raw !== '' && Number.isFinite(value) && value > 0
    ? value * 1000
    : null;
}

export const sessionConfig = {
  /** Hard cap on a session, measured from login. null = rely on JWT `exp` only. */
  maxSessionMs: secondsFromEnv('VITE_SESSION_MAX_SECONDS'),
  /** Logout after this much user inactivity. null = disabled. */
  idleTimeoutMs: secondsFromEnv('VITE_SESSION_IDLE_SECONDS') ?? 30 * 60 * 1000,
  /** Refresh the token this long before it expires. */
  refreshLeadMs: secondsFromEnv('VITE_SESSION_REFRESH_LEAD_SECONDS') ?? 60 * 1000,
  /** Watchdog poll interval (catches sleep / clock jumps). */
  watchdogIntervalMs: 5_000,
  /** Key used to persist the session start timestamp. */
  sessionStartKey: 'sessionStartedAt',
} as const;

export const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;