/**
 * Browser-reachable API base for the Python Big Brain backend.
 * Prefer NEXT_PUBLIC_API_URL (build/runtime); else hostname:3135 (compose publish port).
 */
export function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env && env.trim()) {
    return env.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:3135`;
  }
  return "http://127.0.0.1:3135";
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

export function wsUrl(path: string): string {
  const base = apiBase();
  const u = new URL(base);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${u.origin}${p}`;
}
