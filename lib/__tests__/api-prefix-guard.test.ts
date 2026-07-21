import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { apiFetch } from "@/lib/api";

describe("apiFetch redundant /api prefix guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws when path starts with /api/...", async () => {
    await expect(apiFetch("/api/notifications")).rejects.toThrow(
      /already starts with "\/api"/,
    );
  });

  it("throws when path is exactly /api", async () => {
    await expect(apiFetch("/api")).rejects.toThrow(
      /already starts with "\/api"/,
    );
  });

  it("throws when a hardcoded version prefix is reintroduced (regression case)", async () => {
    await expect(apiFetch("/api/v1/inspector/jobs")).rejects.toThrow(
      /already starts with "\/api"/,
    );
  });

  it("does not throw for a correctly version-relative path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    vi.stubGlobal("localStorage", { getItem: () => null });

    await expect(apiFetch("/notifications")).resolves.toEqual({ ok: true });
  });

  it("does not flag paths that merely contain /api mid-string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    vi.stubGlobal("localStorage", { getItem: () => null });

    await expect(apiFetch("/inspector/jobs?tag=api")).resolves.toEqual({ ok: true });
  });
});

// Static sweep: no lib/*Api.ts module (or lib/api/*.ts) may pass a path literal
// beginning with /api or /api/v1 into apiFetch/apiGet/apiPost/apiPatch/apiPut/apiDelete.
// This is the second guard called for by the issue -- it complements the apiFetch
// runtime assertion by catching the bug even in files that are never exercised by
// other tests, and it fails CI the moment the pattern is reintroduced anywhere in lib/.
describe("static sweep: no lib/*Api.ts module hardcodes a redundant /api prefix", () => {
  // Modules intentionally out of scope for the double-/api-prefix fix. Per maintainer
  // confirmation on issue #2, tenantApi.ts and creditScoreApi.ts call routers mounted on
  // the backend WITHOUT the /api/v1 prefix, via apiGetUnversioned/apiPostUnversioned --
  // so their literal "/api/..." paths are correct by design, not a regression of this
  // guard. This is an interim state pending shelterflex-api#4; once that lands and the
  // routers move under /api/v1, remove both files from this set.
  const ALLOWED_EXCEPTIONS = new Set(["tenantApi.ts", "creditScoreApi.ts"]);

  const REDUNDANT_PREFIX_PATTERN = /["'`]\/api(?:\/|["'`])/;

  function collectApiFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__") continue;
        files = files.concat(collectApiFiles(fullPath));
      } else if (/Api\.ts$/.test(entry.name) || entry.name === "api.ts") {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("finds no redundant /api path literals outside the allowed exceptions", () => {
    const libDir = join(__dirname, "..");
    const apiFiles = collectApiFiles(libDir);

    const offenders: { file: string; line: number; text: string }[] = [];

    for (const filePath of apiFiles) {
      const fileName = filePath.split("/").pop()!;
      if (ALLOWED_EXCEPTIONS.has(fileName)) continue;
      // lib/api.ts itself legitimately defines the "/api/v1" version prefix constant.
      if (fileName === "api.ts" && filePath === join(libDir, "api.ts")) continue;

      const lines = readFileSync(filePath, "utf-8").split("\n");
      lines.forEach((line, idx) => {
        if (REDUNDANT_PREFIX_PATTERN.test(line)) {
          offenders.push({ file: filePath, line: idx + 1, text: line.trim() });
        }
      });
    }

    if (offenders.length > 0) {
      const details = offenders
        .map((o) => `  ${o.file}:${o.line} -> ${o.text}`)
        .join("\n");
      throw new Error(
        `Found path literal(s) starting with /api passed into shared fetch helpers.\n` +
          `apiFetch already prepends the API version prefix, so these will 404.\n${details}`,
      );
    }

    expect(offenders).toEqual([]);
  });
});
