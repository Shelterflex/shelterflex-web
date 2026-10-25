/**
 * Media API Client
 * Uploads photos that forms reference by URL (whistleblower reports, inspection
 * reports) via POST /api/v1/media/photos. Requires a signed-in user.
 */

import { apiFetch } from "./api";

/**
 * Uploads photos and returns their public URLs, in the order given. Use
 * `purpose: "listing"` for photos that advertise an apartment: the API then
 * rejects ones below the minimum resolution.
 */
export async function uploadPhotos(
  files: File[],
  options?: { purpose?: "listing" },
): Promise<string[]> {
  const formData = new FormData();
  // Text fields go first so the server has them before the files.
  if (options?.purpose) formData.append("purpose", options.purpose);
  files.forEach((file) => formData.append("photos", file));

  const { urls } = await apiFetch<{ urls: string[] }>("/media/photos", {
    method: "POST",
    body: formData,
  });
  return urls;
}
