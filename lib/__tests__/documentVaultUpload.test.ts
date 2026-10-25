import { describe, it, expect, vi, beforeEach } from "vitest";

const apiPost = vi.fn();
const apiPatch = vi.fn();

vi.mock("../apiClient", () => ({
  apiGet: vi.fn(),
  apiPost: (...args: unknown[]) => apiPost(...args),
  apiPatch: (...args: unknown[]) => apiPatch(...args),
  apiDelete: vi.fn(),
  withQuery: vi.fn(),
}));

import { uploadDocument } from "../documentVaultApi";

const doc = { id: "DOC-1", fileName: "id.pdf" };

describe("uploadDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiPost.mockResolvedValue({
      data: { documentId: "DOC-1", uploadUrl: "https://s3/put", objectKey: "k" },
    });
    apiPatch.mockResolvedValue({ data: doc });
  });

  it("requests a URL, uploads to storage, confirms, then saves expiry", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
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
    expect(fetchMock).toHaveBeenCalledWith(
      "https://s3/put",
      expect.objectContaining({ method: "PUT", body: file }),
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

  it("does not confirm when the storage upload fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const file = new File(["x"], "id.pdf", { type: "application/pdf" });

    await expect(
      uploadDocument({ file, docType: "id_card" }),
    ).rejects.toThrow(/Upload to storage failed/);
    expect(apiPatch).not.toHaveBeenCalled();
  });
});
