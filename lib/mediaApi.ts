/**
 * Media API Client
 * Uploads photos that forms reference by URL (whistleblower reports, inspection
 * reports) via POST /api/v1/media/photos. Requires a signed-in user.
 */

import { apiFetch } from "./api";

/** Uploads photos and returns their public URLs, in the order given. */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  const { urls } = await apiFetch<{ urls: string[] }>("/media/photos", {
    method: "POST",
    body: formData,
  });
  return urls;
}
