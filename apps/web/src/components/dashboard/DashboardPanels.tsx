import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Clock3,
  Paperclip,
  Send,
  Settings2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants";
import { useSendEmail } from "../../features/email";
import { useUploadAttachment } from "../../features/attachments";
import type { DashboardData } from "../../features/dashboard/dashboard.service";
import {
  formatBytes,
  formatDate,
  initials,
  parseAddressList,
} from "../../lib/format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const providerLabels: Record<string, string> = {
  GMAIL: "Google Workspace",
  YAHOO: "Yahoo Mail",
  MICROSOFT: "Microsoft 365",
  CUSTOM: "Custom SMTP",
};

function PanelHeading({
  icon,
  iconClass,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <CardHeader className="flex flex-row items-start justify-between space-y-0">
      <div>
        <div className="flex items-center gap-2">
          <span className={cn("grid size-7 place-items-center rounded-lg", iconClass)}>
            {icon}
          </span>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
      {action}
    </CardHeader>
  );
}

export function ComposePanel({
  configurations,
}: {
  configurations: DashboardData["smtpConfigurations"];
}) {
  const navigate = useNavigate();
  const send = useSendEmail();
  const enabled = configurations.filter((item) => item.isEnabled);
  const [configurationId, setConfigurationId] = useState(enabled[0]?.id ?? "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const configuration =
    enabled.find((item) => item.id === configurationId) ?? enabled[0];

  async function submit() {
    if (!configuration || !to.trim() || !subject.trim() || !body.trim()) return;
    setError("");
    try {
      const result = await send.mutateAsync({
        smtpConfigurationId: configuration.id,
        to: parseAddressList(to),
        cc: [],
        bcc: [],
        subject,
        body,
        attachmentIds: [],
        trackOpens: true,
        trackClicks: true,
      });
      setTo("");
      setSubject("");
      setBody("");
      navigate(APP_ROUTES.email(result.id));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to send",
      );
    }
  }

  return (
    <Card id="compose">
      <PanelHeading
        icon={<Sparkles size={16} />}
        iconClass="bg-orange-50 text-orange-500"
        title="Quick send"
        description="Send through a connected provider. Full compose supports files."
        action={
          <span className="text-xs text-emerald-700">
            {configuration ? "Connected" : "No SMTP configured"}
          </span>
        }
      />
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>From</Label>
            <NativeSelect
              value={configurationId}
              onChange={(event) => setConfigurationId(event.target.value)}
            >
              {enabled.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} &lt;{item.username}&gt;
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={subject}
            maxLength={120}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
          />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write your message..."
          />
        </div>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <div className="flex items-center justify-between">
          <Button variant="link" className="px-0" asChild>
            <Link to={APP_ROUTES.compose}>Open full composer</Link>
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={send.isPending || !configuration}
          >
            {send.isPending ? <Check size={16} /> : <Send size={16} />}
            {send.isPending ? "Sending..." : "Send email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmtpPanel({
  configurations,
}: {
  configurations: DashboardData["smtpConfigurations"];
}) {
  return (
    <Card id="settings">
      <PanelHeading
        icon={<Settings2 size={16} />}
        iconClass="bg-sky-50 text-sky-600"
        title="SMTP connection"
        description="Connected providers from your account."
        action={
          <Button variant="link" className="px-0" asChild>
            <Link to={APP_ROUTES.smtp}>
              Manage <ArrowUpRight size={14} />
            </Link>
          </Button>
        }
      />
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {configurations.length ? (
          configurations.map((item) => (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2.5 text-sm",
                item.isEnabled && "border-primary/40 ring-2 ring-accent",
              )}
              key={item.id}
            >
              <span className="grid size-6 place-items-center rounded-md bg-primary text-[10px] font-bold text-white">
                {item.provider[0]}
              </span>
              <span className="min-w-0">
                <strong className="block truncate">{item.label}</strong>
                <small className="block truncate text-muted-foreground">
                  {providerLabels[item.provider] ?? item.provider} · {item.username}
                </small>
              </span>
              {item.isEnabled ? (
                <Check size={14} className="ml-auto text-primary" />
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No SMTP configurations yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function TrackingPanel({ stats }: { stats: DashboardData["stats"] }) {
  const openPercent = Math.round(stats.openRate * 1000) / 10;
  return (
    <Card>
      <PanelHeading
        icon={<BarChart3 size={16} />}
        iconClass="bg-emerald-50 text-emerald-700"
        title="Tracking"
        description="A 1×1 pixel is added to sent HTML. Opens are counted only when that image is requested. Gmail cannot reach localhost, so local sends stay at 0% until API_URL is public."
      />
      <CardContent>
        <div className="flex items-center justify-between rounded-lg bg-secondary/60 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Open rate</p>
            <p className="font-heading text-2xl font-bold">{openPercent}%</p>
            <p className="text-xs text-muted-foreground">
              {stats.opened} opened · {stats.clicked} clicks
            </p>
          </div>
          <div
            className="relative grid size-12 place-items-center rounded-full text-[10px] font-bold text-primary"
            style={{
              background: `conic-gradient(var(--color-primary) 0 ${openPercent}%, #e9e8fb ${openPercent}%)`,
            }}
          >
            <span className="absolute inset-1.5 grid place-items-center rounded-full bg-secondary text-[9px]">
              {stats.opened}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityPanel({
  sentEmails,
  receivedEmails,
}: Pick<DashboardData, "sentEmails" | "receivedEmails">) {
  return (
    <Card className="lg:row-span-2">
      <PanelHeading
        icon={<Clock3 size={16} />}
        iconClass="bg-violet-50 text-violet-700"
        title="Recent activity"
        description="Latest messages from your account."
        action={
          <Button variant="link" className="px-0" asChild>
            <Link to={APP_ROUTES.history}>
              View all <ArrowUpRight size={14} />
            </Link>
          </Button>
        }
      />
      <CardContent>
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent">Send history</TabsTrigger>
            <TabsTrigger value="received">Receive history</TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            {sentEmails.length ? (
              sentEmails.map((item) => {
                const name = item.recipients[0]?.address ?? "Unknown recipient";
                return (
                  <Link
                    className="flex items-center gap-2 border-b py-3 text-sm last:border-0"
                    key={item.id}
                    to={APP_ROUTES.email(item.id)}
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-white">
                      {initials(name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate">{name}</strong>
                      <small className="block truncate text-muted-foreground">
                        {item.subject || "No subject"}
                      </small>
                    </span>
                    <span className="text-right text-xs text-muted-foreground">
                      {formatDate(item.sentAt ?? item.createdAt)}
                      <small className="mt-1 block">{item.status}</small>
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </TabsContent>
          <TabsContent value="received">
            {receivedEmails.length ? (
              receivedEmails.map((item) => {
                const name = item.from ?? "Unknown sender";
                return (
                  <div
                    className="flex items-center gap-2 border-b py-3 text-sm last:border-0"
                    key={item.id}
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-white">
                      {initials(name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate">{name}</strong>
                      <small className="block truncate text-muted-foreground">
                        {item.subject || "No subject"}
                      </small>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.receivedAt)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function AttachmentsPanel({
  attachments,
}: {
  attachments: DashboardData["attachments"];
}) {
  const upload = useUploadAttachment();
  return (
    <Card>
      <PanelHeading
        icon={<Paperclip size={16} />}
        iconClass="bg-amber-50 text-amber-600"
        title="Attachments"
        description="Files uploaded to your workspace."
        action={
          <Button variant="ghost" size="icon" asChild>
            <label>
              <Upload size={16} />
              <input
                type="file"
                hidden
                aria-label="Upload attachment"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                }}
              />
            </label>
          </Button>
        }
      />
      <CardContent>
        {attachments.length ? (
          attachments.slice(0, 3).map((file) => (
            <div className="flex items-center gap-2 py-2" key={file.id}>
              <span className="grid h-8 w-7 place-items-center rounded bg-orange-50 text-[9px] font-extrabold text-orange-600">
                {file.mimeType.split("/").pop()?.slice(0, 4).toUpperCase()}
              </span>
              <span>
                <strong className="block text-sm">{file.originalName}</strong>
                <small className="text-xs text-muted-foreground">
                  {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
                </small>
              </span>
            </div>
          ))
        ) : (
          <div className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <Upload size={18} className="mb-1 text-primary" />
            <strong className="text-sm">No attachments</strong>
            <span className="text-xs">Upload a file here or when composing</span>
          </div>
        )}
        {upload.isError ? (
          <Alert variant="destructive" className="mt-3">
            {upload.error instanceof Error ? upload.error.message : "Upload failed"}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
