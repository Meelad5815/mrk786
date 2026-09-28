export default function Home() {
  const endpoint = "/api/mcp";
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>
      <section style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 8px 30px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#2563eb" }}>
          MRK OFFICIAL
        </div>
        <h1 style={{ fontSize: 42, margin: "10px 0 12px" }}>WordPress MCP Server</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#4b5563" }}>
          Gemini or another MCP-compatible host can use this secure server to read and manage the configured WordPress website.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginTop: 28 }}>
          {[
            ["Content", "Posts, pages, search, drafts, publishing"],
            ["Media", "List, inspect and upload media"],
            ["SEO", "SEO package and SEO-ready draft helpers"],
            ["Taxonomy", "Categories, tags and taxonomies"],
            ["System", "Site status, API user, post types, comments"],
            ["Security", "Bearer-protected MCP endpoint; secrets stay server-side"],
          ].map(([title, text]) => (
            <div key={title} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
              <strong>{title}</strong>
              <div style={{ marginTop: 7, color: "#6b7280", lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: 18, background: "#111827", color: "#fff", borderRadius: 14 }}>
          <div style={{ fontSize: 13, opacity: .7 }}>MCP endpoint</div>
          <code>{endpoint}</code>
        </div>

        <div style={{ marginTop: 22, color: "#6b7280", lineHeight: 1.6 }}>
          Configure <code>WORDPRESS_URL</code>, <code>WORDPRESS_USERNAME</code>,
          <code>WORDPRESS_APP_PASSWORD</code> and <code>MCP_AUTH_TOKEN</code> in Vercel.
          Never put credentials in GitHub or browser code.
        </div>
      </section>
    </main>
  );
}