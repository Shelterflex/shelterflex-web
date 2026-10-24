// Listing photos are served by the backend's /media route rather than shipped
// in public/. NEXT_PUBLIC_ is inlined at build time, so this is safe to read at
// module scope (mock data builds its URLs on import).
const DEFAULT_MEDIA_BASE_URL = "https://shelterflex.zplague.xyz/media";

export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL
).replace(/\/$/, "");

/** Absolute URL for a media path such as `/properties/1/kitchen.jpg`. */
export function mediaUrl(path: string): string {
  return `${MEDIA_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
