// Runtime configuration helpers for backend URL.
// Exports functions (not top-level constants) so importing this module
// does not read process.env at build time and accidentally bake values
// into the client bundle.

// `next build` sets NEXT_PHASE=phase-production-build for the duration of
// the build process, including the static/RSC prerender pass. This is
// distinct from real runtime (`next start`, or the standalone server.js
// produced by `output: "standalone"`), where NEXT_PHASE is not set to this
// value. We use this to let prerendering complete with a placeholder,
// without requiring the real BACKEND_URL to exist until the container
// actually starts and injects it.
const IS_BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build';
const BUILD_PLACEHOLDER_URL = 'https://backend.invalid';

export function getServerBackendUrl(): string {
  const raw = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!raw) {
    if (IS_BUILD_PHASE) {
      // Prerendering doesn't need a reachable backend, just a well-formed
      // URL so any code that constructs requests/origins from it doesn't
      // throw. This value is never sent to a real user.
      return BUILD_PLACEHOLDER_URL;
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL). Set BACKEND_URL to an absolute URL like https://api.example.com'
      );
    }
    return 'http://localhost:4000';
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch (e) {
    throw new Error(
      `Invalid BACKEND_URL value (${raw}). Expected an absolute URL like https://api.example.com`
    );
  }

  return parsed.href.replace(/\/$/, '');
}

export function getServerBackendOrigin(): string {
  const url = getServerBackendUrl();
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: { BACKEND_URL?: string };
  }
}

export function getClientBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const runtime = window.__RUNTIME_CONFIG__?.BACKEND_URL;
    if (runtime) return runtime.replace(/\/$/, '');
    // Allow a dev fallback when runtime config is not provided.
    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:4000';
    }
    throw new Error(
      'Missing runtime BACKEND_URL. The server must inject runtime configuration (see app/layout.tsx).'
    );
  }

  // If somehow called on the server, delegate to server getter.
  // (During `next build` prerendering this also resolves via the
  // IS_BUILD_PHASE branch above, rather than throwing.)
  return getServerBackendUrl();
}

export function getRuntimeBackendUrl(): string {
  return typeof window === 'undefined' ? getServerBackendUrl() : getClientBackendUrl();
}