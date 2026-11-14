// Local server: node --env-file=.env scripts/dev.js   (then open http://localhost:3000)
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import state from "../api/state.js";
import notes from "../api/notes.js";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const wrap = (res) => { res.status = (c) => { res.statusCode = c; return res; }; res.json = (o) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(o)); }; return res; };

http.createServer(async (req, res) => {
  wrap(res);
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/state") return state(req, res);
  if (url.pathname === "/api/notes") {
    let body = ""; for await (const c of req) body += c;
    req.body = body ? JSON.parse(body) : {};
    return notes(req, res);
  }
  const file = join("public", url.pathname === "/" ? "index.html" : url.pathname);
  try { const buf = await readFile(file); res.setHeader("content-type", TYPES[extname(file)] || "text/plain"); res.end(buf); }
  catch { res.statusCode = 404; res.end("not found"); }
}).listen(process.env.PORT || 3000, () => console.log("http://localhost:" + (process.env.PORT || 3000)));
