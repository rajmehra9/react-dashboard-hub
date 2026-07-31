import {
  EC2Icon,
  RDSIcon,
  S3Icon,
  VPCIcon,
  LBIcon,
  Route53Icon,
  EKSIcon,
} from "@/components/icons/aws-icons";

const serviceIconMap = {
  ec2: EC2Icon,
  vpc: VPCIcon,
  lb: LBIcon,
  s3: S3Icon,
  rds: RDSIcon,
  route53: Route53Icon,
  eks: EKSIcon,
} as const;

function getServiceIcon(service: string) {
  const normalizedService = service?.toLowerCase();
  return serviceIconMap[normalizedService as keyof typeof serviceIconMap] ?? EC2Icon;
}

interface ServiceQuota {
  service: string;
  label: string;
  current: number;
  max: number;
  remaining: number;
  percentage: number;
}

interface Props {
  quotas: ServiceQuota[];
  isLoading?: boolean;
}

export function ServiceQuotasCard({ quotas, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h3 className="text-sm font-medium mb-4">Resources by Service</h3>
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!quotas || quotas.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h3 className="text-sm font-medium mb-4">Resources by Service</h3>
        <p className="text-xs text-muted-foreground">No quota data available.</p>
      </div>
    );
  }

  const maxCount = Math.max(...quotas.map((quota) => quota.current ?? 0), 1);

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium">Resources by Service</h3>
        </div>
      </div>

      <div className="space-y-4">
        {quotas.map((quota) => {
          const countLabel = quota.current ?? 0;
          const serviceKey = quota.service || quota.label;
          const displayLabel = quota.label || quota.service;
          const ServiceIcon = getServiceIcon(serviceKey);
          const barWidth = Math.max((countLabel / maxCount) * 100, 4);

          return (
            <div key={quota.service} className="space-y-1.5 border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                <div className="flex min-w-[88px] items-center gap-2">
                  <ServiceIcon className="text-foreground/80 shrink-0" size={14} />
                  <span className="truncate text-[11px]">{displayLabel}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] text-foreground/80">
                  {countLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
