import { useParams } from "react-router-dom";
import { attachmentService } from "../attachments";
import { formatBytes, formatDate } from "../../lib/format";
import { useEmail } from "./use-emails";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailDetailPage() {
  const { id } = useParams();
  const email = useEmail(id);
  if (email.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <p className="text-sm text-muted-foreground">Loading message...</p>
      </div>
    );
  }
  if (email.isError || !email.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Alert variant="destructive">This email was not found in your account.</Alert>
      </div>
    );
  }
  const item = email.data;
  const clicks =
    item.trackingEvents?.filter((event) => event.type === "CLICK").length ?? 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="MESSAGE"
        title={item.subject}
        description={`${item.status} · ${item.smtpConfiguration?.label} · ${item.openCount} recorded opens · ${clicks} recorded clicks`}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted-foreground">
              To:{" "}
              {item.recipients
                .filter((recipient) => recipient.type === "TO")
                .map((recipient) => recipient.address)
                .join(", ") || "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Sent {formatDate(item.sentAt)} · First opened{" "}
              {formatDate(item.firstOpenedAt)}
            </p>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-sans text-sm">
              {item.body}
            </pre>
            {item.attachments?.length ? (
              <div>
                <h2 className="mb-2 font-semibold">Attachments</h2>
                {item.attachments.map((file) => (
                  <Button
                    key={file.id}
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      void attachmentService.download(file.id, file.originalName)
                    }
                  >
                    {file.originalName} · {formatBytes(file.sizeBytes)}
                  </Button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tracking events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Open counts are approximate. Mail clients may cache or proxy images.
            </p>
            {item.trackingEvents?.length ? (
              item.trackingEvents.map((event) => (
                <div className="border-b py-2 last:border-0" key={event.id}>
                  <strong className="text-sm">{event.type}</strong>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.createdAt)}
                    {event.url ? ` · ${event.url}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No tracking events recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
