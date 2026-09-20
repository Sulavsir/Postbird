import { Upload } from "lucide-react";
import { attachmentService } from "./attachment.service";
import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "./use-attachments";
import { formatBytes, formatDate } from "../../lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function AttachmentsPage() {
  const attachments = useAttachments();
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const { confirm, modal } = useConfirmDialog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="FILES"
        title="Attachments"
        description="This is a file library for your account. Upload PDFs, images (including WEBP), and office files here, then include them when you compose. Sending attaches the selected files to the SMTP message — they are not emailed from this page."
        action={
          <Button asChild>
            <label>
              <Upload size={16} /> Upload
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                }}
              />
            </label>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6">
          {upload.isError ? (
            <Alert variant="destructive">
              {upload.error instanceof Error
                ? upload.error.message
                : "Upload failed"}
            </Alert>
          ) : null}
          {attachments.data?.length ? (
            attachments.data.map((file) => (
              <div className="flex items-center gap-3 border-b py-3 last:border-0" key={file.id}>
                <span className="grid h-8 w-8 place-items-center rounded bg-orange-50 text-[9px] font-extrabold text-orange-600">
                  {file.mimeType.split("/").pop()?.slice(0, 4).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{file.originalName}</strong>
                  <small className="text-xs text-muted-foreground">
                    {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
                  </small>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() =>
                    void attachmentService.download(file.id, file.originalName)
                  }
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  type="button"
                  onClick={() => {
                    void (async () => {
                      const confirmed = await confirm({
                        title: "Delete attachment",
                        description: `Delete ${file.originalName}? This removes the file from your library.`,
                        confirmLabel: "Delete file",
                      });
                      if (confirmed) remove.mutate(file.id);
                    })();
                  }}
                >
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <Upload size={20} className="mb-1 text-primary" />
              <strong className="text-sm">No attachments</strong>
              <span className="text-xs">PDF, images, and office documents up to 25MB</span>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmModal {...modal} />
    </div>
  );
}
