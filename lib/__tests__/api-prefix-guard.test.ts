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

  it("finds no redundant /api path literals in lib/ API modules", () => {
    const libDir = join(__dirname, "..");
    const apiFiles = collectApiFiles(libDir);

    const offenders: { file: string; line: number; text: string }[] = [];

    for (const filePath of apiFiles) {
      const fileName = filePath.split("/").pop()!;
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

// Pages, components and hooks call the shared helpers directly too. Here only
// the first argument of an api* helper call is checked, since these files also
// hold unrelated "/api..." strings (e.g. Next.js route handlers).
describe("static sweep: no app/components/hooks call passes a /api-prefixed path", () => {
  const HELPER_CALL_WITH_API_PATH =
    /\bapi(?:Fetch|Get|Post|Put|Patch|Delete)\s*(?:<[^>]*>)?\s*\(\s*["'`]\/api(?:\/|["'`])/;

  function collectSourceFiles(dir: string): string[] {
    let files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__" || entry.name === "node_modules") continue;
        files = files.concat(collectSourceFiles(fullPath));
      } else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("finds no helper call with a redundant /api prefix", () => {
    const root = join(__dirname, "..", "..");
    const offenders = ["app", "components", "hooks"]
      .flatMap((dir) => collectSourceFiles(join(root, dir)))
      .flatMap((filePath) =>
        readFileSync(filePath, "utf-8")
          .split("\n")
          .map((text, idx) => ({ file: filePath, line: idx + 1, text: text.trim() }))
          .filter(({ text }) => HELPER_CALL_WITH_API_PATH.test(text)),
      );

    expect(offenders.map((o) => `${o.file}:${o.line} -> ${o.text}`)).toEqual([]);
  });
});
