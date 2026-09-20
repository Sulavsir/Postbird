import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants";
import { formatDate, initials } from "../../lib/format";
import { useDeleteEmail, useEmails } from "./use-emails";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function HistoryPage() {
  const emails = useEmails(1);
  const remove = useDeleteEmail();
  const { confirm, modal } = useConfirmDialog();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="OUTBOUND"
        title="Sent history"
        description="Delivery status and open counts come from stored messages and tracking events, not placeholder data. Queued, sent, and failed messages can be deleted."
      />
      <Card>
        <CardContent className="p-6">
          {emails.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : null}
          {emails.isError ? (
            <Alert variant="destructive">Unable to load sent mail.</Alert>
          ) : null}
          {remove.isError ? (
            <Alert variant="destructive">
              {remove.error instanceof Error
                ? remove.error.message
                : "Unable to delete this email."}
            </Alert>
          ) : null}
          {!emails.data?.data.length && !emails.isLoading ? (
            <p className="text-sm text-muted-foreground">No sent mail yet.</p>
          ) : null}
          {emails.data?.data.map((item) => {
            const name = item.recipients[0]?.address ?? "Unknown recipient";
            return (
              <div
                className="flex items-center gap-3 border-b py-3 last:border-0"
                key={item.id}
              >
                <Link
                  className="flex min-w-0 flex-1 items-center gap-3"
                  to={APP_ROUTES.email(item.id)}
                >
                  <span className="grid size-7 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-white">
                    {initials(name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{item.subject}</strong>
                    <small className="text-xs text-muted-foreground">
                      {name} · {item.openCount} opens
                    </small>
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                    {formatDate(item.sentAt ?? item.createdAt)}
                    <small className="mt-1 block">{item.status}</small>
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => {
                    void (async () => {
                      const confirmed = await confirm({
                        title: "Delete email",
                        description: `Delete “${item.subject}”? This removes it from Postbird history only.`,
                        confirmLabel: "Delete email",
                      });
                      if (confirmed) remove.mutate(item.id);
                    })();
                  }}
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <ConfirmModal {...modal} />
    </div>
  );
}
