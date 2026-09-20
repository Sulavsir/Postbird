import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants";
import { useAuth } from "../../features/auth/auth-context";
import { useDashboard } from "../../features/dashboard";
import { PageHeader } from "../layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "./StatsGrid";
import {
  ActivityPanel,
  AttachmentsPanel,
  ComposePanel,
  SmtpPanel,
  TrackingPanel,
} from "./DashboardPanels";

export function DashboardPage() {
  const { user: sessionUser } = useAuth();
  const dashboard = useDashboard();
  const navigate = useNavigate();
  if (dashboard.isError)
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Alert variant="destructive">Unable to load your workspace.</Alert>
      </div>
    );
  const data =
    dashboard.data?.user?.id &&
    sessionUser?.id &&
    dashboard.data.user.id === sessionUser.id
      ? dashboard.data
      : undefined;
  if (dashboard.isLoading || !data)
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    );
  const {
    user,
    stats,
    smtpConfigurations,
    sentEmails,
    receivedEmails,
    attachments,
  } = data;
  const displayName = user?.displayName || user?.email || "Workspace";
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow={new Date()
          .toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toUpperCase()}
        title={`Good morning, ${displayName.split(" ")[0]}`}
        description="Counts, history, and tracking below come from your account, not sample data."
        action={
          <Button type="button" onClick={() => navigate(APP_ROUTES.compose)}>
            <Plus size={16} /> Compose email
          </Button>
        }
      />
      <StatsGrid stats={stats} />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ComposePanel configurations={smtpConfigurations} />
        <SmtpPanel configurations={smtpConfigurations} />
        <TrackingPanel stats={stats} />
        <ActivityPanel
          sentEmails={sentEmails}
          receivedEmails={receivedEmails}
        />
        <AttachmentsPanel attachments={attachments} />
      </div>
      <footer className="mt-8 flex flex-col justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>Postbird</span>
        <span>SMTP operations workspace</span>
      </footer>
    </div>
  );
}
