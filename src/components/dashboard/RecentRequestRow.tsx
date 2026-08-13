import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parseBackendTimestamp } from "@/utils/date";
import { useAwsConfig } from "@/hooks/useAwsConfig";
import { SERVICE_LABELS } from "@/components/requests/vmRequestsApi";
import { STAKEHOLDER_ROLE } from "./dashboardConstants";
import { getRequestStatusLabel, getRequestStatusStyle } from "./dashboardUtils";
import type { RecentRequest } from "./dashboardTypes";

interface RecentRequestRowProps {
  request: RecentRequest;
  currentUser?: { name?: string; role?: string } | null;
}

export function RecentRequestRow({
  request,
  currentUser,
}: RecentRequestRowProps) {
  const navigate = useNavigate();
  const { data: awsConfig } = useAwsConfig();

  const isAwsConnected = awsConfig?.status === "CONNECTED";
  const status = getRequestStatusStyle(request?.status);
  const StatusIcon = status.icon;

  const serviceLabel =
    SERVICE_LABELS[request.service ?? ""] ?? request.service ?? "Request";

  const isStakeholder = currentUser?.role === STAKEHOLDER_ROLE;
  const isOwnRequest = request.user_name === currentUser?.name;
  const logsCleared = !!request.logs_cleared_at;

  // Stakeholders may only open the console for their own requests.
  const canOpenConsole = isStakeholder
    ? isAwsConnected && !logsCleared && isOwnRequest
    : isAwsConnected && !logsCleared;

  const statusLabel = getRequestStatusLabel(request.status);

  const rowContent = (
    <div
      onClick={() =>
        canOpenConsole && navigate(`/console?request=${request.request_id}`)
      }
      className={cn(
        "flex items-center justify-between p-4 transition-colors",
        canOpenConsole
          ? "hover:bg-muted/30 cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("rounded-lg p-2", status.bg)}>
          <StatusIcon
            className={cn(
              "h-5 w-5",
              status.color,
              status.animate && "animate-spin"
            )}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            {statusLabel} {serviceLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {request.user_name}
            {request.region?.trim() && <> • {request.region}</>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            request.status === "training" && "border-warning/50 text-warning"
          )}
        >
          {statusLabel}
        </Badge>

        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(
            parseBackendTimestamp(request.updated_at ?? request.created_at),
            { addSuffix: true }
          )}
        </span>
      </div>
    </div>
  );

  if (logsCleared) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
        <TooltipContent>
          <p>Logs Cleared</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isAwsConnected) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
        <TooltipContent>
          <p>AWS Disconnected</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return rowContent;
}
