const WP_URL = (process.env.WORDPRESS_URL || "").replace(/\/$/, "");
const WP_USER = process.env.WORDPRESS_USERNAME || "";
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || "";

function assertConfig() {
  if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) {
    throw new Error("WordPress is not configured. Add WORDPRESS_URL, WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD.");
  }
}

function authHeader() {
  return "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

export function getWordPressUrl() {
  return WP_URL;
}

export async function wpFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  binary = false,
): Promise<T> {
  assertConfig();
  const headers = new Headers(init.headers);
  headers.set("Authorization", authHeader());
  if (!binary && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${WP_URL}/wp-json/wp/v2${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const raw = await res.text();
  let data: unknown = raw;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as {message?: unknown}).message)
        : `WordPress API error ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function wpSite() {
  assertConfig();
  const res = await fetch(WP_URL, { cache: "no-store" });
  return {
    url: WP_URL,
    reachable: res.ok,
    status: res.status,
    title: res.headers.get("x-powered-by") ? "WordPress" : WP_URL,
  };
}

export const getPosts = (params = "") => wpFetch(`/posts${params ? `?${params}` : ""}`);
export const getPost = (id: number) => wpFetch(`/posts/${id}`);
export const searchPosts = (q: string, perPage = 10) =>
  wpFetch(`/posts?search=${encodeURIComponent(q)}&per_page=${perPage}`);

export const createPost = (body: Record<string, unknown>) =>
  wpFetch("/posts", { method: "POST", body: JSON.stringify(body) });

export const updatePost = (id: number, body: Record<string, unknown>) =>
  wpFetch(`/posts/${id}`, { method: "POST", body: JSON.stringify(body) });

export const trashPost = (id: number) =>
  wpFetch(`/posts/${id}`, { method: "DELETE", body: JSON.stringify({}) });

export const getPages = (params = "") => wpFetch(`/pages${params ? `?${params}` : ""}`);
export const getPage = (id: number) => wpFetch(`/pages/${id}`);
export const createPage = (body: Record<string, unknown>) =>
  wpFetch("/pages", { method: "POST", body: JSON.stringify(body) });
export const updatePage = (id: number, body: Record<string, unknown>) =>
  wpFetch(`/pages/${id}`, { method: "POST", body: JSON.stringify(body) });

export const getCategories = (params = "") =>
  wpFetch(`/categories${params ? `?${params}` : ""}`);
export const createCategory = (body: Record<string, unknown>) =>
  wpFetch("/categories", { method: "POST", body: JSON.stringify(body) });

export const getTags = (params = "") =>
  wpFetch(`/tags${params ? `?${params}` : ""}`);
export const createTag = (body: Record<string, unknown>) =>
  wpFetch("/tags", { method: "POST", body: JSON.stringify(body) });

export const getMedia = (params = "") =>
  wpFetch(`/media${params ? `?${params}` : ""}`);
export const getMediaItem = (id: number) => wpFetch(`/media/${id}`);

export async function uploadMedia(input: {
  filename: string;
  mimeType: string;
  base64: string;
  title?: string;
  alt_text?: string;
  caption?: string;
}) {
  const bytes = Buffer.from(input.base64, "base64");
  const media = await wpFetch("/media", {
    method: "POST",
    headers: {
      "Content-Type": input.mimeType,
      "Content-Disposition": `attachment; filename="${input.filename.replace(/["\\]/g, "_")}"`,
    },
    body: bytes,
  }, true);

  const id = (media as {id?: number}).id;
  if (!id) return media;

  return wpFetch(`/media/${id}`, {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      alt_text: input.alt_text,
      caption: input.caption,
    }),
  });
}

export async function getUsersMe() {
  return wpFetch("/users/me");
}

export async function getTypes() {
  return wpFetch("/types");
}

export async function getTaxonomies() {
  return wpFetch("/taxonomies");
}

export async function getComments(params = "") {
  return wpFetch(`/comments${params ? `?${params}` : ""}`);
}

export async function createComment(body: Record<string, unknown>) {
  return wpFetch("/comments", { method: "POST", body: JSON.stringify(body) });
}