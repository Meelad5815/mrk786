# MRK WordPress MCP

A Vercel/Next.js remote Model Context Protocol server for controlling a WordPress site through the official WordPress REST API.

## Architecture

Gemini / MCP host → HTTPS → MRK MCP on Vercel → WordPress REST API → Posts / Pages / Media / Taxonomy / Comments

The server uses Vercel's current `mcp-handler` 2.x adapter and the MCP TypeScript SDK v2. It is stateless and uses Streamable HTTP through a Next.js Route Handler.

## Tools

### Site
- wp_site_status
- wp_health_check
- wp_get_current_user

### Posts
- wp_get_posts
- wp_get_post
- wp_search_posts
- wp_create_post
- wp_update_post
- wp_trash_post
- wp_publish_post
- wp_create_seo_draft
- wp_generate_seo_package

### Pages
- wp_get_pages
- wp_get_page
- wp_create_page
- wp_update_page

### Taxonomy
- wp_get_categories
- wp_create_category
- wp_get_tags
- wp_create_tag
- wp_get_types
- wp_get_taxonomies

### Media
- wp_get_media
- wp_get_media_item
- wp_upload_media

### Comments
- wp_get_comments
- wp_create_comment

## Environment variables

Set these in Vercel:

```
WORDPRESS_URL=https://your-site.example
WORDPRESS_USERNAME=mrk_api
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
MCP_AUTH_TOKEN=long-random-secret
```

Create a dedicated WordPress API user and an Application Password. Do not commit credentials to GitHub.

## Local development

```
npm install
npm run dev
```

MCP endpoint:

```
http://localhost:3000/api/mcp
```

## Vercel

Import this GitHub repository into Vercel. Use Node.js 20+ and add all four environment variables. The current Vercel MCP/Next.js pattern uses `mcp-handler` 2.x and supports the current 2026-07-28 MCP protocol while maintaining compatibility with 2025-era stateless Streamable HTTP clients.

## Important behavior

- New posts/pages default to drafts.
- Publishing and trashing are explicit tools.
- WordPress credentials never go to the browser.
- The MCP endpoint requires a Bearer token.
- This server executes actions when an MCP host such as Gemini calls its tools. It does not independently decide to publish or modify content without a tool call.

## Security

Use HTTPS in production, keep the MCP token secret, use a dedicated WordPress integration user with the minimum practical role, and revoke the WordPress Application Password if it is ever exposed.