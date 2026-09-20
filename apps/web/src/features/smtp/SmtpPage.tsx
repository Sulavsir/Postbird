import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, PlugZap, Trash2 } from "lucide-react";
import {
  SMTP_PROVIDER_PRESETS,
  SMTP_PROVIDERS,
  smtpConfigurationSchema,
  type SmtpProvider,
} from "@postbird/shared";
import { formatDate } from "../../lib/format";
import {
  useCreateSmtpConfiguration,
  useDeleteSmtpConfiguration,
  useSmtpConfigurations,
  useTestSmtpConnection,
} from "./use-smtp-configurations";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";

const formSchema = smtpConfigurationSchema;
type FormValues = z.input<typeof formSchema>;

export function SmtpPage() {
  const configurations = useSmtpConfigurations();
  const create = useCreateSmtpConfiguration();
  const test = useTestSmtpConnection();
  const remove = useDeleteSmtpConfiguration();
  const { confirm, modal } = useConfirmDialog();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "GMAIL",
      label: "Gmail",
      host: SMTP_PROVIDER_PRESETS.GMAIL.host,
      port: SMTP_PROVIDER_PRESETS.GMAIL.port,
      security: SMTP_PROVIDER_PRESETS.GMAIL.security,
      username: "",
      password: "",
      isEnabled: true,
    },
  });
  const provider = form.watch("provider") as SmtpProvider;
  const preset = SMTP_PROVIDER_PRESETS[provider];
  const locked = provider !== "CUSTOM";

  function applyProvider(next: SmtpProvider) {
    const nextPreset = SMTP_PROVIDER_PRESETS[next];
    form.setValue("provider", next);
    form.setValue("label", nextPreset.label);
    form.setValue("host", nextPreset.host);
    form.setValue("port", nextPreset.port);
    form.setValue("security", nextPreset.security);
  }

  async function onSubmit(values: FormValues) {
    setError("");
    setNotice("");
    try {
      await create.mutateAsync(formSchema.parse(values));
      setNotice("SMTP configuration saved. Test the connection before sending.");
      form.setValue("password", "");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save SMTP configuration",
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="PROVIDERS"
        title="SMTP configuration"
        description="This connection belongs only to the Postbird user you are signed in as. Add your own Gmail app password — if you reuse someone else’s SMTP, their mailbox gets the sent mail."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a connection</CardTitle>
            <CardDescription>{preset.help}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {SMTP_PROVIDERS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm",
                    provider === item && "border-primary ring-2 ring-accent",
                  )}
                  onClick={() => applyProvider(item)}
                >
                  <span className="grid size-6 place-items-center rounded-md bg-primary text-[10px] font-bold text-white">
                    {item[0]}
                  </span>
                  <span>
                    {SMTP_PROVIDER_PRESETS[item].label}
                    <small className="block text-muted-foreground">
                      {item === "CUSTOM"
                        ? "Your host and port"
                        : `${SMTP_PROVIDER_PRESETS[item].host}:${SMTP_PROVIDER_PRESETS[item].port}`}
                    </small>
                  </span>
                  {provider === item ? (
                    <Check size={14} className="ml-auto text-primary" />
                  ) : null}
                </button>
              ))}
            </div>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit((values) => void onSubmit(values))}
            >
              <div className="space-y-2">
                <Label>Label</Label>
                <Input {...form.register("label")} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Host</Label>
                  <Input readOnly={locked} {...form.register("host")} />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    readOnly={locked}
                    {...form.register("port", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Security</Label>
                  <NativeSelect disabled={locked} {...form.register("security")}>
                    <option value="TLS">TLS (implicit)</option>
                    <option value="STARTTLS">STARTTLS</option>
                    <option value="NONE">None</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input {...form.register("username")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password / app password</Label>
                <PasswordInput
                  autoComplete="new-password"
                  {...form.register("password")}
                />
              </div>
              {error ? <Alert variant="destructive">{error}</Alert> : null}
              {notice ? <Alert variant="success">{notice}</Alert> : null}
              <Button type="submit" disabled={create.isPending}>
                Save configuration
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved connections</CardTitle>
            <CardDescription>
              Test a connection or remove it from this account. Sent mail stays in
              history after a connection is deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {configurations.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : null}
            {configurations.data?.length ? (
              configurations.data.map((item) => (
                <div
                  className="flex items-start justify-between gap-3 border-b py-3 last:border-0"
                  key={item.id}
                >
                  <div>
                    <strong>{item.label}</strong>
                    <p className="text-xs text-muted-foreground">
                      {item.username} · {item.host}:{item.port} · {item.security}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.isEnabled ? "Enabled" : "Disabled"} · Last verified{" "}
                      {formatDate(item.lastVerifiedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setError("");
                        test.mutate(item.id, {
                          onSuccess: () => setNotice(`Verified ${item.label}`),
                          onError: (testError) =>
                            setError(
                              testError instanceof Error
                                ? testError.message
                                : "Connection test failed",
                            ),
                        });
                      }}
                    >
                      <PlugZap size={14} /> Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      type="button"
                      disabled={remove.isPending}
                      onClick={() => {
                        void (async () => {
                          const confirmed = await confirm({
                            title: "Remove SMTP connection",
                            description: `Remove ${item.label} (${item.username})? You will need to add it again before sending. Existing sent mail stays in history.`,
                            confirmLabel: "Remove connection",
                          });
                          if (!confirmed) return;
                          setError("");
                          setNotice("");
                          try {
                            await remove.mutateAsync(item.id);
                            setNotice(`${item.label} was removed.`);
                          } catch (removeError) {
                            setError(
                              removeError instanceof Error
                                ? removeError.message
                                : "Unable to remove this SMTP connection",
                            );
                          }
                        })();
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No SMTP configurations yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmModal {...modal} />
    </div>
  );
}
