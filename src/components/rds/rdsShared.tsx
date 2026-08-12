import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check, CheckCircle2, Clock, Copy } from "lucide-react";
import { EMPTY_VALUE } from "./rdsConstants";
import type { RdsRole, RdsStatus } from "./rdsTypes";

/** Copy-to-clipboard state shared by the detail panels. */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(
    (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedKey(null), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copiedKey, copy };
}

export function CopyIconButton({
  text,
  copied,
  onCopy,
  size = 14,
  className = "",
}: {
  text: string;
  copied: boolean;
  onCopy: (text: string) => void;
  size?: number;
  className?: string;
}) {
  if (copied) {
    return <Check size={size} className={`text-success shrink-0 ${className}`} />;
  }

  return (
    <button
      type="button"
      aria-label="Copy to clipboard"
      onClick={() => onCopy(text)}
      className={`shrink-0 text-muted-foreground hover:text-primary transition-colors ${className}`}
    >
      <Copy size={size} />
    </button>
  );
}

export function StatusBadge({ status }: { status: RdsStatus }) {
  const styles: Partial<Record<RdsStatus, { cls: string; icon: ReactNode }>> = {
    Available: {
      cls: "bg-success/10 text-success border-success/20",
      icon: <CheckCircle2 size={11} />,
    },
    Provisioning: {
      cls: "bg-primary/10 text-primary border-primary/20",
      icon: <Clock size={11} />,
    },
    Terminating: {
      cls: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <AlertCircle size={11} />,
    },
    Stopped: {
      cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: <AlertCircle size={11} />,
    },
    Modifying: {
      cls: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      icon: <Clock size={11} />,
    },
  };

  const { cls, icon } = styles[status] ?? styles.Available!;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      {icon} {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: RdsRole }) {
  const styles: Record<RdsRole, string> = {
    "Regional cluster": "bg-primary/10 text-primary border-primary/20",
    "Writer instance": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Reader instance": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Standalone: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${styles[role]}`}>
      {role}
    </span>
  );
}

export function RdsStatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex-1 min-w-[140px] flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur px-4 py-3 hover:border-primary/30 transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** Brand mark used by the RDS quota card. */
export function RdsQuotaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.34121 0.785714L4.99204 4.43654L4.43654 4.99204L0.785714 1.34121V4.32143H0V0.392857C0 0.176 0.175607 0 0.392857 0H4.32143V0.785714H1.34121ZM22 0.392857V4.32143H21.2143V1.34121L17.5635 4.99204L17.008 4.43654L20.6588 0.785714H17.6786V0H21.6071C21.8243 0 22 0.176 22 0.392857ZM21.2143 17.6786H22V21.6071C22 21.824 21.8243 22 21.6071 22H17.6786V21.2143H20.6588L17.008 17.5635L17.5635 17.008L21.2143 20.6588V17.6786ZM21.0179 10.6908C21.0179 9.38693 19.5124 8.09875 16.9911 7.24507L17.2429 6.501C20.141 7.48196 21.8036 9.009 21.8036 10.6908C21.8036 12.373 20.141 13.9005 17.2425 14.881L16.9907 14.1366C19.5124 13.2833 21.0179 11.9955 21.0179 10.6908ZM1.00414 10.6908C1.00414 11.9401 2.41332 13.1941 4.774 14.0458L4.50725 14.7848C1.78161 13.8015 0.218428 12.3094 0.218428 10.6908C0.218428 9.07264 1.78161 7.58057 4.50725 6.59686L4.774 7.33582C2.41332 8.18793 1.00414 9.44193 1.00414 10.6908ZM4.99204 17.5635L1.34121 21.2143H4.32143V22H0.392857C0.175607 22 0 21.824 0 21.6071V17.6786H0.785714V20.6588L4.43654 17.008L4.99204 17.5635ZM11 7.57664C8.19264 7.57664 6.67857 6.85143 6.67857 6.55521C6.67857 6.25861 8.19264 5.53379 11 5.53379C13.807 5.53379 15.3214 6.25861 15.3214 6.55521C15.3214 6.85143 13.807 7.57664 11 7.57664ZM11.0114 10.6193C8.32346 10.6193 6.67857 9.88507 6.67857 9.48554V7.57586C7.64618 8.10975 9.36257 8.36236 11 8.36236C12.6374 8.36236 14.3538 8.10975 15.3214 7.57586V9.48554C15.3214 9.88546 13.6852 10.6193 11.0114 10.6193ZM11.0114 13.6192C8.32346 13.6192 6.67857 12.8849 6.67857 12.4854V10.5529C7.63361 11.1143 9.32721 11.405 11.0114 11.405C12.6861 11.405 14.3699 11.1147 15.3214 10.5549V12.4854C15.3214 12.8853 13.6852 13.6192 11.0114 13.6192ZM11 16.3106C8.20404 16.3106 6.67857 15.5591 6.67857 15.1729V13.5528C7.63361 14.1142 9.32721 14.4049 11.0114 14.4049C12.6861 14.4049 14.3699 14.115 15.3214 13.5548V15.1729C15.3214 15.5591 13.796 16.3106 11 16.3106ZM11 4.74807C8.54032 4.74807 5.89286 5.31339 5.89286 6.55521V15.1729C5.89286 16.4356 8.46214 17.0964 11 17.0964C13.5379 17.0964 16.1071 16.4356 16.1071 15.1729V6.55521C16.1071 5.31339 13.4597 4.74807 11 4.74807Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Label + value pair used by the configuration tab. */
export function ConfigField({ label, value }: { label?: string; value?: ReactNode }) {
  return (
    <div>
      {label && <div className="text-xs text-muted-foreground mb-0.5">{label}</div>}
      <div className="text-sm text-foreground break-words">{value ?? EMPTY_VALUE}</div>
    </div>
  );
}

/** Label + monospace value with an inline copy affordance. */
export function FieldWithCopy({ label, value }: { label: string; value: string }) {
  const { copiedKey, copy } = useCopyToClipboard();

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <CopyIconButton
          text={value}
          copied={copiedKey === label}
          onCopy={(text) => copy(text, label)}
        />
        <span className="text-sm font-mono break-all">{value || EMPTY_VALUE}</span>
      </div>
    </div>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
      <CheckCircle2 size={14} />
      {label}
    </div>
  );
}
