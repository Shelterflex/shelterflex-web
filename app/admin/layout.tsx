// app/admin/layout.tsx
//
// These admin pages read backend config at render/request time
// (via getClientBackendUrl() -> window.__RUNTIME_CONFIG__, or
// getServerBackendUrl() on the server). None of them should be
// statically prerendered at build time, since BACKEND_URL is only
// guaranteed to be set in the real runtime environment, not in the
// build/CI container.
//
// Setting `dynamic = "force-dynamic"` on this layout applies to every
// page nested under app/admin/, so individual pages (health, reports,
// future admin pages) don't each need their own copy of this line.

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}