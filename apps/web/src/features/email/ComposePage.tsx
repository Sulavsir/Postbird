import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSmtpConfigurations } from "../smtp";
import { useSendEmail } from "./use-emails";
import { useAttachments, useUploadAttachment } from "../attachments";
import { APP_ROUTES } from "../../constants";
import { formatBytes, parseAddressList } from "../../lib/format";
import type { AttachmentSummary } from "../attachments";
import { entityIdSchema } from "@postbird/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const composeSchema = z.object({
  smtpConfigurationId: entityIdSchema,
  to: z.string().min(1, "Add at least one recipient"),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().trim().min(1).max(255),
  body: z.string().min(1),
  trackOpens: z.boolean(),
  trackClicks: z.boolean(),
});
type ComposeValues = z.infer<typeof composeSchema>;

export function ComposePage() {
  const navigate = useNavigate();
  const smtp = useSmtpConfigurations();
  const send = useSendEmail();
  const upload = useUploadAttachment();
  const library = useAttachments();
  const [files, setFiles] = useState<AttachmentSummary[]>([]);
  const [error, setError] = useState("");
  const enabled = smtp.data?.filter((item) => item.isEnabled) ?? [];
  const form = useForm<ComposeValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      smtpConfigurationId: "",
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      trackOpens: true,
      trackClicks: true,
    },
  });

  async function onSubmit(values: ComposeValues) {
    setError("");
    try {
      const result = await send.mutateAsync({
        smtpConfigurationId: values.smtpConfigurationId,
        to: parseAddressList(values.to),
        cc: parseAddressList(values.cc ?? ""),
        bcc: parseAddressList(values.bcc ?? ""),
        subject: values.subject,
        body: values.body,
        attachmentIds: files.map((file) => file.id),
        trackOpens: values.trackOpens,
        trackClicks: values.trackClicks,
      });
      navigate(APP_ROUTES.email(result.id));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to send email",
      );
    }
  }

  async function onFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const uploaded = await upload.mutateAsync(file);
      setFiles((current) => [...current, uploaded]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="OUTBOUND"
        title="Compose email"
        description="Send through a verified SMTP configuration. Files from Attachments can be reused here. Open tracking only records a hit when the recipient’s client loads the pixel from a publicly reachable API_URL."
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          {!enabled.length ? (
            <Alert variant="destructive">
              Add and enable an SMTP configuration before sending.
            </Alert>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => void onSubmit(values))}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>From (saved SMTP account)</Label>
                <NativeSelect {...form.register("smtpConfigurationId")}>
                  <option value="">Select an SMTP account</option>
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
                  placeholder="one@example.com, two@example.com"
                  {...form.register("to")}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CC</Label>
                <Input {...form.register("cc")} />
              </div>
              <div className="space-y-2">
                <Label>BCC</Label>
                <Input {...form.register("bcc")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input {...form.register("subject")} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea className="min-h-44" {...form.register("body")} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                <Paperclip size={14} />
                Attach file
                <input
                  type="file"
                  hidden
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,image/webp"
                  onChange={(event) => void onFile(event.target.files)}
                />
              </Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("trackOpens")} /> Open tracking
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("trackClicks")} /> Click tracking
              </label>
              <Button
                className="ml-auto"
                type="submit"
                disabled={send.isPending || !enabled.length}
              >
                <Send size={16} /> {send.isPending ? "Sending..." : "Send email"}
              </Button>
            </div>
            {library.data?.length ? (
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">From your attachment library</p>
                <p className="text-xs text-muted-foreground">
                  Files uploaded on the Attachments page can be included on this send.
                </p>
                {library.data.map((file) => {
                  const selected = files.some((item) => item.id === file.id);
                  return (
                    <label key={file.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setFiles((current) =>
                            selected
                              ? current.filter((item) => item.id !== file.id)
                              : [...current, file],
                          )
                        }
                      />
                      {file.originalName} · {formatBytes(file.sizeBytes)}
                    </label>
                  );
                })}
              </div>
            ) : null}
            {files.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {files.map((file) => (
                  <li key={file.id}>
                    {file.originalName} · {formatBytes(file.sizeBytes)}
                  </li>
                ))}
              </ul>
            ) : null}
            {error ? <Alert variant="destructive">{error}</Alert> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
