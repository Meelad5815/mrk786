const url = process.argv[2];
const token = process.env.MCP_AUTH_TOKEN;

if (!url || !token) {
  console.error("Usage: MCP_AUTH_TOKEN=... node scripts/test-mcp.mjs https://domain/api/mcp");
  process.exit(1);
}

const body = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2026-07-28",
    capabilities: {},
    clientInfo: { name: "mrk-test-client", version: "1.0.0" }
  }
};

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(body)
});

console.log("HTTP", res.status);
console.log(await res.text());