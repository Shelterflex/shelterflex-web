// Runtime configuration helpers for backend URL.
// Exports functions (not top-level constants) so importing this module
// does not read process.env at build time and accidentally bake values
// into the client bundle.

export function getServerBackendUrl(): string {
  const raw = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!raw) {
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
  return getServerBackendUrl();
}

export function getRuntimeBackendUrl(): string {
  return typeof window === 'undefined' ? getServerBackendUrl() : getClientBackendUrl();
}
