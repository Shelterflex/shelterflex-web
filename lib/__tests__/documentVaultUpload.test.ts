import { describe, it, expect, vi, beforeEach } from "vitest";

const apiPost = vi.fn();
const apiPatch = vi.fn();
const apiUploadBinary = vi.fn();

vi.mock("../apiClient", () => ({
  apiGet: vi.fn(),
  apiPost: (...args: unknown[]) => apiPost(...args),
  apiPatch: (...args: unknown[]) => apiPatch(...args),
  apiDelete: vi.fn(),
  withQuery: vi.fn(),
}));

vi.mock("../api", () => ({
  apiUploadBinary: (...args: unknown[]) => apiUploadBinary(...args),
  apiDownloadBlob: vi.fn(),
}));

import { uploadDocument } from "../documentVaultApi";

const doc = { id: "DOC-1", fileName: "id.pdf" };

describe("uploadDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiPost.mockResolvedValue({
      data: { documentId: "DOC-1", uploadUrl: "/documents/DOC-1/content", objectKey: "k" },
    });
    apiPatch.mockResolvedValue({ data: doc });
  });

  it("sends the file to the API, confirms, then saves expiry", async () => {
    const file = new File(["x"], "id.pdf", { type: "application/pdf" });

    await uploadDocument({
      file,
      docType: "id_card",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });

    expect(apiPost).toHaveBeenCalledWith("/documents/upload-url", {
      docType: "id_card",
      contentType: "application/pdf",
    });
    expect(apiUploadBinary).toHaveBeenCalledWith(
      "/documents/DOC-1/content",
      file,
      "application/pdf",
    );
    expect(apiPatch).toHaveBeenNthCalledWith(1, "/documents/DOC-1/confirm", {
      objectKey: "k",
      fileName: "id.pdf",
      fileSizeBytes: 1,
    });
    expect(apiPatch).toHaveBeenNthCalledWith(2, "/tenant/vault/DOC-1", {
      expiresAt: "2030-01-01T00:00:00.000Z",
      description: undefined,
    });
  });

  it("does not confirm when the upload fails", async () => {
    apiUploadBinary.mockRejectedValue(new Error("Upload failed"));
    const file = new File(["x"], "id.pdf", { type: "application/pdf" });

    await expect(
      uploadDocument({ file, docType: "id_card" }),
    ).rejects.toThrow(/Upload failed/);
    expect(apiPatch).not.toHaveBeenCalled();
  });
});
