import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { imapSyncSchema } from "@postbird/shared";
import { formatDate, initials } from "../../lib/format";
import { useReceivedEmails, useSyncInbox, useDeleteReceivedEmail } from "./use-received";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

type SyncValues = z.infer<typeof imapSyncSchema>;

export function InboxPage() {
  const received = useReceivedEmails();
  const sync = useSyncInbox();
  const remove = useDeleteReceivedEmail();
  const { confirm, modal } = useConfirmDialog();
  const form = useForm<SyncValues>({
    resolver: zodResolver(imapSyncSchema),
    defaultValues: {
      host: "",
      port: 993,
      secure: true,
      username: "",
      password: "",
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="INBOUND"
        title="Received mail"
        description="SMTP cannot receive mail. Inbox sync uses IMAP with credentials you supply for this request only. Passwords are not stored."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>IMAP sync</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit((values) =>
                sync.mutate(values, { onError: () => undefined }),
              )}
            >
              <div className="space-y-2">
                <Label>Host</Label>
                <Input {...form.register("host")} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    {...form.register("port", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input {...form.register("username")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <PasswordInput {...form.register("password")} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("secure")} /> Use TLS
              </label>
              {sync.isError ? (
                <Alert variant="destructive">
                  {sync.error instanceof Error
                    ? sync.error.message
                    : "IMAP sync failed"}
                </Alert>
              ) : null}
              {sync.isSuccess ? (
                <Alert variant="success">
                  Synchronized {sync.data.synced} messages.
                </Alert>
              ) : null}
              <Button disabled={sync.isPending}>
                {sync.isPending ? "Syncing..." : "Sync inbox"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            {received.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : null}
            {received.data?.length ? (
              received.data.map((item) => (
                <div className="flex items-center gap-2 border-b py-3 last:border-0" key={item.id}>
                  <span className="grid size-7 place-items-center rounded-full bg-violet-400 text-[10px] font-bold text-white">
                    {initials(item.from ?? "NA")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {item.from ?? "Unknown sender"}
                    </strong>
                    <small className="text-xs text-muted-foreground">
                      {item.subject || "No subject"}
                    </small>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.receivedAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => {
                      void (async () => {
                        const confirmed = await confirm({
                          title: "Delete received message",
                          description:
                            "Delete this message from Postbird? It stays in the mailbox on the mail server.",
                          confirmLabel: "Delete message",
                        });
                        if (confirmed) remove.mutate(item.id);
                      })();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No received messages stored yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmModal {...modal} />
    </div>
  );
}
