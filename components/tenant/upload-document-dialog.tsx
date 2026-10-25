"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  uploadDocument,
  DOC_TYPE_LABELS,
  MAX_UPLOAD_BYTES,
  UPLOAD_ACCEPT,
  type DocumentDocType,
} from "@/lib/documentVaultApi";
import { showSuccessToast } from "@/lib/toast";

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const DOC_TYPES = Object.keys(DOC_TYPE_LABELS) as DocumentDocType[];

// Documents that lapse, so the vault can warn before they expire.
const EXPIRING_TYPES: DocumentDocType[] = ["id_card", "passport"];

const fieldClass =
  "w-full border-3 border-foreground bg-background px-3 py-2 text-sm focus:outline-none";

export function UploadDocumentDialog({
  open,
  onClose,
  onUploaded,
}: UploadDocumentDialogProps) {
  const [docType, setDocType] = useState<DocumentDocType>("id_card");
  const [file, setFile] = useState<File | null>(null);
  const [expiresOn, setExpiresOn] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDocType("id_card");
    setFile(null);
    setExpiresOn("");
    setDescription("");
    setError(null);
  }

  function handleClose() {
    if (uploading) return;
    reset();
    onClose();
  }

  function handleFile(next: File | null) {
    setError(null);
    if (next && next.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("That file is larger than 25 MB.");
      return;
    }
    setFile(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadDocument({
        file,
        docType,
        expiresAt: expiresOn
          ? new Date(`${expiresOn}T23:59:59Z`).toISOString()
          : undefined,
        description: description.trim() || undefined,
      });
      showSuccessToast(`${file.name} was added to your vault.`, "Uploaded");
      reset();
      onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="border-3 border-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>
            PDF, JPG, PNG, WebP or Word files up to 25 MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="upload-doc-type" className="mb-1 block text-sm font-bold">
              Document type
            </label>
            <select
              id="upload-doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentDocType)}
              className={fieldClass}
            >
              {DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOC_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="upload-doc-file" className="mb-1 block text-sm font-bold">
              File
            </label>
            <input
              id="upload-doc-file"
              type="file"
              accept={UPLOAD_ACCEPT}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="upload-doc-expiry" className="mb-1 block text-sm font-bold">
              Expiry date{" "}
              <span className="font-normal text-muted-foreground">
                {EXPIRING_TYPES.includes(docType)
                  ? "(we'll warn you before it lapses)"
                  : "(optional)"}
              </span>
            </label>
            <input
              id="upload-doc-expiry"
              type="date"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="upload-doc-notes" className="mb-1 block text-sm font-bold">
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="upload-doc-notes"
              value={description}
              maxLength={500}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-bold text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="border-2 border-foreground font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !file}
              className="border-2 border-foreground bg-primary font-bold"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
