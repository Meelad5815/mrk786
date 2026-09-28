import { z } from "zod";
import {
  createCategory, createComment, createPage, createPost, createTag,
  getCategories, getComments, getMedia, getMediaItem, getPage, getPages,
  getPost, getPosts, getTags, getTaxonomies, getTypes, getUsersMe,
  searchPosts, trashPost, updatePage, updatePost, uploadMedia, wpSite,
} from "./wordpress";

const ok = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});
const fail = (error: unknown) => ({
  isError: true,
  content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }],
});

async function run<T>(fn: () => Promise<T>) {
  try { return ok(await fn()); } catch (e) { return fail(e); }
}

const id = z.number().int().positive();

export function registerWordPressTools(server: any) {
  server.registerTool("wp_site_status", {
    title: "WordPress Site Status",
    description: "Check whether the configured WordPress site is reachable.",
    inputSchema: z.object({}),
  }, async () => run(wpSite));

  server.registerTool("wp_get_current_user", {
    title: "Get Current WordPress API User",
    description: "Return the WordPress user used by the MCP connection.",
    inputSchema: z.object({}),
  }, async () => run(getUsersMe));

  server.registerTool("wp_get_posts", {
    title: "Get WordPress Posts",
    description: "List WordPress posts. Supports status, search, page, per_page, category and tag query parameters.",
    inputSchema: z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).max(100).optional(),
      category: z.number().int().positive().optional(),
      tag: z.number().int().positive().optional(),
    }),
  }, async (a: any) => run(() => getPosts(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_get_post", {
    title: "Get WordPress Post",
    description: "Get one WordPress post by ID.",
    inputSchema: z.object({ id }),
  }, async ({ id }: {id:number}) => run(() => getPost(id)));

  server.registerTool("wp_search_posts", {
    title: "Search WordPress Posts",
    description: "Search posts by keyword.",
    inputSchema: z.object({ search: z.string().min(1), per_page: z.number().int().min(1).max(100).optional() }),
  }, async ({ search, per_page }: {search:string;per_page?:number}) => run(() => searchPosts(search, per_page ?? 10)));

  server.registerTool("wp_create_post", {
    title: "Create WordPress Post",
    description: "Create a post. Defaults to draft. Use publish only when explicitly requested.",
    inputSchema: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      status: z.enum(["draft", "publish", "pending", "private"]).default("draft"),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      categories: z.array(id).optional(),
      tags: z.array(id).optional(),
      featured_media: id.optional(),
      author: id.optional(),
    }),
  }, async (a: any) => run(() => createPost(a)));

  server.registerTool("wp_update_post", {
    title: "Update WordPress Post",
    description: "Update an existing post. Only supplied fields are changed.",
    inputSchema: z.object({
      id,
      title: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "publish", "pending", "private"]).optional(),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      categories: z.array(id).optional(),
      tags: z.array(id).optional(),
      featured_media: id.optional(),
    }),
  }, async ({ id, ...body }: any) => run(() => updatePost(id, body)));

  server.registerTool("wp_trash_post", {
    title: "Trash WordPress Post",
    description: "Move a WordPress post to trash. This is a destructive action.",
    inputSchema: z.object({ id }),
  }, async ({ id }: {id:number}) => run(() => trashPost(id)));

  server.registerTool("wp_get_pages", {
    title: "Get WordPress Pages",
    description: "List WordPress pages.",
    inputSchema: z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).max(100).optional(),
    }),
  }, async (a: any) => run(() => getPages(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_get_page", {
    title: "Get WordPress Page",
    description: "Get one WordPress page by ID.",
    inputSchema: z.object({ id }),
  }, async ({ id }: {id:number}) => run(() => getPage(id)));

  server.registerTool("wp_create_page", {
    title: "Create WordPress Page",
    description: "Create a page. Defaults to draft.",
    inputSchema: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      status: z.enum(["draft", "publish", "pending", "private"]).default("draft"),
      slug: z.string().optional(),
      parent: id.optional(),
      featured_media: id.optional(),
    }),
  }, async (a: any) => run(() => createPage(a)));

  server.registerTool("wp_update_page", {
    title: "Update WordPress Page",
    description: "Update an existing page.",
    inputSchema: z.object({
      id,
      title: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "publish", "pending", "private"]).optional(),
      slug: z.string().optional(),
      parent: id.optional(),
      featured_media: id.optional(),
    }),
  }, async ({ id, ...body }: any) => run(() => updatePage(id, body)));

  server.registerTool("wp_get_categories", {
    title: "Get WordPress Categories",
    description: "List WordPress categories.",
    inputSchema: z.object({ search: z.string().optional(), per_page: z.number().int().min(1).max(100).optional() }),
  }, async (a: any) => run(() => getCategories(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_create_category", {
    title: "Create WordPress Category",
    description: "Create a category.",
    inputSchema: z.object({ name: z.string().min(1), slug: z.string().optional(), description: z.string().optional(), parent: id.optional() }),
  }, async (a: any) => run(() => createCategory(a)));

  server.registerTool("wp_get_tags", {
    title: "Get WordPress Tags",
    description: "List WordPress tags.",
    inputSchema: z.object({ search: z.string().optional(), per_page: z.number().int().min(1).max(100).optional() }),
  }, async (a: any) => run(() => getTags(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_create_tag", {
    title: "Create WordPress Tag",
    description: "Create a tag.",
    inputSchema: z.object({ name: z.string().min(1), slug: z.string().optional(), description: z.string().optional() }),
  }, async (a: any) => run(() => createTag(a)));

  server.registerTool("wp_get_media", {
    title: "Get WordPress Media",
    description: "List WordPress media items.",
    inputSchema: z.object({ search: z.string().optional(), media_type: z.enum(["image","video","audio","application"]).optional(), per_page: z.number().int().min(1).max(100).optional() }),
  }, async (a: any) => run(() => getMedia(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_get_media_item", {
    title: "Get WordPress Media Item",
    description: "Get one media item by ID.",
    inputSchema: z.object({ id }),
  }, async ({ id }: {id:number}) => run(() => getMediaItem(id)));

  server.registerTool("wp_upload_media", {
    title: "Upload WordPress Media",
    description: "Upload an image or other media file using base64 data.",
    inputSchema: z.object({
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      base64: z.string().min(1),
      title: z.string().optional(),
      alt_text: z.string().optional(),
      caption: z.string().optional(),
    }),
  }, async (a: any) => run(() => uploadMedia(a)));

  server.registerTool("wp_get_types", {
    title: "Get WordPress Post Types",
    description: "List registered WordPress post types visible through the REST API.",
    inputSchema: z.object({}),
  }, async () => run(getTypes));

  server.registerTool("wp_get_taxonomies", {
    title: "Get WordPress Taxonomies",
    description: "List registered WordPress taxonomies visible through the REST API.",
    inputSchema: z.object({}),
  }, async () => run(getTaxonomies));

  server.registerTool("wp_get_comments", {
    title: "Get WordPress Comments",
    description: "List WordPress comments.",
    inputSchema: z.object({ search: z.string().optional(), post: id.optional(), per_page: z.number().int().min(1).max(100).optional() }),
  }, async (a: any) => run(() => getComments(new URLSearchParams(Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString())));

  server.registerTool("wp_create_comment", {
    title: "Create WordPress Comment",
    description: "Create a comment on a post.",
    inputSchema: z.object({
      post: id,
      content: z.string().min(1),
      author_name: z.string().optional(),
      author_email: z.string().email().optional(),
      parent: id.optional(),
    }),
  }, async (a: any) => run(() => createComment(a)));

  server.registerTool("wp_generate_seo_package", {
    title: "Generate SEO Package",
    description: "Create deterministic SEO fields from supplied content. It does not call an external AI service.",
    inputSchema: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      keyword: z.string().optional(),
    }),
  }, async ({ title, content, keyword }: {title:string;content:string;keyword?:string}) => run(async () => {
    const clean = content.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim();
    const key = keyword?.trim() || title.split(/\\s+/).slice(0, 4).join(" ");
    const description = clean.slice(0, 155).replace(/\\s+\\S*$/, "") + (clean.length > 155 ? "…" : "");
    const slug = title.toLowerCase().normalize("NFKD").replace(/[^\\p{L}\\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    const headings = (content.match(/<h[1-6][^>]*>.*?<\\/h[1-6]>/gis) || []).length;
    return { keyword: key, seo_title: title.slice(0, 60), meta_description: description, suggested_slug: slug, word_count: clean ? clean.split(/\\s+/).length : 0, heading_count: headings };
  }));

  server.registerTool("wp_create_seo_draft", {
    title: "Create SEO WordPress Draft",
    description: "Create a WordPress draft with supplied content plus SEO-ready excerpt and slug.",
    inputSchema: z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      keyword: z.string().optional(),
      categories: z.array(id).optional(),
      tags: z.array(id).optional(),
      featured_media: id.optional(),
    }),
  }, async ({ title, content, keyword, categories, tags, featured_media }: any) => run(async () => {
    const clean = content.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim();
    const excerpt = clean.slice(0, 155).replace(/\\s+\\S*$/, "") + (clean.length > 155 ? "…" : "");
    const slug = title.toLowerCase().normalize("NFKD").replace(/[^\\p{L}\\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    return createPost({ title, content, status: "draft", slug, excerpt, categories, tags, featured_media, meta: keyword ? { _mrk_focus_keyword: keyword } : undefined });
  }));

  server.registerTool("wp_publish_post", {
    title: "Publish WordPress Post",
    description: "Publish an existing post. Use only when the user explicitly asks to publish it.",
    inputSchema: z.object({ id }),
  }, async ({ id }: {id:number}) => run(() => updatePost(id, { status: "publish" })));

  server.registerTool("wp_health_check", {
    title: "MRK WordPress Health Check",
    description: "Run a compact integration check: site, authenticated user, post types and taxonomies.",
    inputSchema: z.object({}),
  }, async () => run(async () => ({
    site: await wpSite(),
    user: await getUsersMe(),
    types: await getTypes(),
    taxonomies: await getTaxonomies(),
  })));
}