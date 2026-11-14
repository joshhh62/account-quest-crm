// Server-side MCP client. The token only ever lives in process.env.AQ_TOKEN.
const MCP = process.env.AQ_MCP_URL || "https://questathon.aihackerscollective.com/api/public/mcp";

export class McpError extends Error {
  constructor(msg, status) { super(msg); this.status = status; }
}

export async function callTool(name, args = {}) {
  const token = process.env.AQ_TOKEN;
  if (!token) throw new McpError("AQ_TOKEN is not set on the server", 500);
  const res = await fetch(MCP, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new McpError(`Non-JSON reply (${res.status}): ${text.slice(0, 120)}`, res.status); }
  if (body.error) throw new McpError(body.error.message || "MCP error", res.status);
  const r = body.result;
  if (!r || r.isError) throw new McpError(r?.content?.[0]?.text?.slice(0, 200) || "tool error", res.status);
  try { return JSON.parse(r.content[0].text); } catch { return r.content[0].text; }
}
