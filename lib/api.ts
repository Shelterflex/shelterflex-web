const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!baseUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `API error: ${res.status}`);
  }

  return res.json();
}