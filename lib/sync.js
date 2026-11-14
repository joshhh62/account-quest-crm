// Keeps one cached copy of the game data per server instance and spends the MCP's
// one-call-a-minute budget in a fixed order: accounts, signals, existing notes, then notes to write.
import { callTool } from "./mcp.js";
import { ACCOUNTS, SIGNALS, FILES, EXTRA_ACCOUNTS, EXTRA_FILES } from "./baseline.js";
import { buildView } from "./engine.js";
import { BASE, BASE_NOTE, BASE_INDEX, BASE_SEARCH, TOOL_DOCS, summarize, pathsIn, textOf } from "./toolkit.js";

const GAP_MS = 62_000;          // each token gets one call a minute, writes included
const SIGNALS_EVERY_MS = 90_000; // how often we look for new events once everything else is done
const ACCOUNTS_EVERY_MS = 10 * 60_000;

const S = (globalThis.__aq ||= {
  accounts: null, accountsAt: 0, signals: null, signalsAt: 0, notes: null, notesAt: 0,
  lastCall: 0, calls: 0, err: null, queue: [], written: new Set(), busy: false,
});

S.tools ||= {}; S.cyc ||= {}; S.searchQ ||= []; S.extra ||= {}; S.extraFiles ||= {};
S.data ||= { ...structuredClone(BASE), pw: {}, records: {}, files: {}, index: null, indexFirst: null, search: {}, live: {} };

const BASE_EXPORT = { exported_at: "2026-11-14T07:49:19.019Z", accounts: ACCOUNTS };
const BASE_IDS = SIGNALS.map((s) => s.id);

async function call(name, args = {}) {
  const t = (S.tools[name] ||= { calls: 0, last: 0, ok: null, summary: "", err: null });
  t.calls++; t.last = Date.now();
  try { const d = await callTool(name, args); t.ok = true; t.err = null; t.summary = summarize(name, d); return d; }
  catch (e) { t.ok = false; t.err = String(e.message || e).slice(0, 120); throw e; }
}

function markerFor(id) { return `[CRM:${id}]`; }
function noteTitles() { return (S.notes?.notes || S.notes || []).map((n) => `${n.title || ""} ${n.text || ""}`); }
function hasNote(id) { return S.written.has(id) || noteTitles().some((t) => t.includes(markerFor(id))); }

// Events already seen stay on the page even if the feed later returns fewer; live ones win by id.
function currentSignals() {
  const live = Array.isArray(S.signals?.signals) ? S.signals.signals : [];
  const byId = new Map(SIGNALS.map((s) => [s.id, s]));
  for (const s of live) byId.set(s.id, s);
  return [...byId.values()];
}
// Accounts released during the build (get_new_account) join the export; the baseline copy of K fills in until the live read lands.
function currentExport() {
  const base = Array.isArray(S.accounts?.accounts) ? S.accounts : BASE_EXPORT;
  const have = new Set(base.accounts.map((a) => a.id));
  const extras = [], files = [...(base.files || [])];
  for (const a of EXTRA_ACCOUNTS) if (!have.has(a.id) && !S.extra[a.id]) { extras.push(a); have.add(a.id); }
  for (const [id, exp] of Object.entries(S.extra)) for (const a of exp.accounts || []) if (!have.has(a.id)) { extras.push(a); have.add(a.id); for (const f of exp.files || []) if (!files.some((x) => x.id === f.id)) files.push(f); }
  if (!extras.length) return base;
  for (const f of EXTRA_FILES) if (extras.some((a) => a.id === f.account) && !files.some((x) => x.id === f.id)) files.push(f);
  return { ...base, accounts: [...base.accounts, ...extras], files };
}

export function getView() {
  const now = Date.now();
  const view = buildView({ accountsExport: currentExport(), signals: currentSignals(), notes: S.notes?.notes || [], baselineSignalIds: BASE_IDS, status: {}, live: { files: S.data.files, pw: S.data.pw, records: S.data.records } });
  view.status = {
    accounts: S.accounts ? "live" : "baseline", signals: S.signals ? "live" : "baseline",
    accountsAt: S.accountsAt || null, signalsAt: S.signalsAt || null, now,
    nextCallInMs: Math.max(0, S.lastCall + GAP_MS - now), callsThisInstance: S.calls,
    tokenConfigured: Boolean(process.env.AQ_TOKEN), queue: S.queue.length,
    notesWritten: currentSignals().filter((s) => hasNote(s.id)).map((s) => s.id), error: S.err,
  };
  view.toolkit = toolkitView(now, view);
  return view;
}


// ---- the other nine tools: a slow rotation after the core steps, one call a minute for everything ----
const M = 60_000;
function fileIds() { return [...new Set([...(S.accounts?.files || []).map((f) => f.id), ...FILES.map((f) => f.id)])]; }
function extraFileList() { const ex = currentExport(); const seen = new Set(fileIds()); return (ex.files || []).filter((f) => !seen.has(f.id) && f.account); }
function extraAccountIds() { return currentExport().accounts.map((a) => a.id).filter((id) => id !== "A" && id !== "B"); }
function pendingNewAccounts() {
  const ids = new Set([...(S.data.whoami?.new_accounts || []).map((x) => x.id), ...(S.data.whoami?.pack || []).map((x) => x.account)]);
  const have = new Set([...(Array.isArray(S.accounts?.accounts) ? S.accounts.accounts : []).map((a) => a.id), ...Object.keys(S.extra)]);
  return [...ids].filter((id) => id && !have.has(id));
}
function cycleList() {
  return [
    ["whoami", "whoami", {}, 3 * M],
    ["get_feature_requests", "get_feature_requests", {}, 20 * M],
    ["get_release_notes", "get_release_notes", {}, 30 * M],
    ["get_flytbase_team", "get_flytbase_team", {}, 30 * M],
    ["get_data_format", "get_data_format", {}, 60 * M],
    ["list_paperwork", "list_paperwork", {}, 10 * M],
    ["get_all_paperwork:A", "get_all_paperwork", { account: "A" }, 20 * M],
    ["get_all_paperwork:B", "get_all_paperwork", { account: "B" }, 20 * M],
    ["get_paperwork_record:A", "get_paperwork_record", { account: "A", path: "contract.txt" }, 30 * M],
    ["get_paperwork_record:B", "get_paperwork_record", { account: "B", path: "contract.txt" }, 30 * M],
    ...extraAccountIds().flatMap((id) => [[`get_all_paperwork:${id}`, "get_all_paperwork", { account: id }, 20 * M]]),
    ...fileIds().map((id) => [`get_file:${id}`, "get_file", { id }, 45 * M]),
    ...extraFileList().map((f) => [`get_new_account_file:${f.id}`, "get_new_account_file", { account: f.account, file_id: f.id }, 45 * M]),
  ];
}
function dueTool(now) {
  const L = cycleList();
  const fresh = L.find(([k]) => !S.cyc[k]);
  if (fresh) return fresh;
  let best = null, bestAge = 0;
  for (const e of L) { const age = now - S.cyc[e[0]] - e[3]; if (age > bestAge) { best = e; bestAge = age; } }
  return best;
}
function recordsIn(d) {
  const out = [];
  const w = (o) => { if (Array.isArray(o)) o.forEach(w); else if (o && typeof o === "object") { if (typeof o.path === "string" && (o.text != null || o.content != null || o.body != null)) out.push({ path: o.path, text: textOf(o.text ?? o.content ?? o.body) }); else if (typeof o.path === "string" && o.data != null) out.push({ path: o.path, text: JSON.stringify(o.data) }); else Object.values(o).forEach(w); } };
  w(d);
  if (!out.length && d && typeof d === "object") for (const [k, v] of Object.entries(d)) if (typeof v === "string" && /\.(txt|json|csv)$/.test(k)) out.push({ path: k, text: v });
  return out;
}
function ingest(key, name, args, d) {
  const D = S.data; D.live[name] = Date.now();
  if (name === "whoami") { D.whoami = d; if (Number(d.signals) > currentSignals().length) S.signalsAt = 0; }
  else if (name === "get_feature_requests") {
    const rs = Array.isArray(d.requests) ? d.requests : [];
    D.requests = rs.filter((r) => (r.raised_by_your_accounts || []).length).map((r) => ({ id: r.id, title: r.title, status: r.status, mentions: r.mentions, by: r.raised_by_your_accounts }));
    D.requestTotal = rs.length;
  }
  else if (name === "get_release_notes") { if (Array.isArray(d.releases)) D.releases = d.releases; }
  else if (name === "get_flytbase_team") { if (Array.isArray(d.people)) D.team = d.people; }
  else if (name === "get_data_format") { D.schema = { title: d.title, required: d.required || [], acctRequired: d.properties?.accounts?.items?.required || [] }; }
  else if (name === "list_paperwork") {
    const idx = {};
    for (const a of d.accounts || []) idx[a.account] = (a.files || []).map((f) => f.path);
    D.index = idx; D.indexFirst ||= JSON.parse(JSON.stringify(idx));
  }
  else if (name === "get_all_paperwork") { D.pw[args.account] = Object.fromEntries(recordsIn(d).map((r) => [r.path, r.text])); }
  else if (name === "get_paperwork_record") { D.records[`${args.account}:${args.path}`] = textOf(d); }
  else if (name === "get_file") { D.files[args.id] = textOf(d); }
  else if (name === "get_new_account_file") { D.files[args.file_id] = textOf(d); }
}

function ago(t, now) { return t ? Math.max(0, Math.round((now - t) / 1000)) : null; }
function toolkitView(now, view) {
  const D = S.data;
  const tools = TOOL_DOCS.map((t) => {
    const st = S.tools[t.name];
    const live = Boolean(st && st.ok);
    const wrote = t.name === "write_note" ? currentSignals().filter((x) => hasNote(x.id)).length : 0;
    const summary = st?.summary || (t.name === "write_note" ? (wrote ? `${wrote} notes in the game, written by this CRM` : "none yet") : BASE_NOTE[t.name] || "waiting for its turn");
    return { name: t.name, use: t.use, calls: st?.calls || 0, ago: ago(st?.last, now), ok: st ? st.ok : (t.name === "write_note" && wrote ? true : null), err: st?.err || null, summary, live: live || (t.name === "write_note" && wrote > 0) };
  });
  const sch = D.schema, ex = S.accounts;
  const schema = ex ? { checked: true, missing: (sch.required || []).filter((k) => !(k in ex)), acctMissing: (ex.accounts || []).flatMap((a) => (sch.acctRequired || []).filter((k) => !(k in a)).map((k) => `${a.id}.${k}`)) } : { checked: false, missing: [], acctMissing: [] };
  const idx = D.index || null, first = D.indexFirst || {};
  const paperwork = idx ? Object.fromEntries(Object.entries(idx).map(([a, ps]) => [a, { records: ps.length, newSinceStart: ps.filter((p) => !(first[a] || []).includes(p)) }])) : Object.fromEntries(Object.entries(BASE_INDEX).map(([a, n]) => [a, { records: n, newSinceStart: [], copy: true }]));
  const rel = [...(D.releases || [])].sort((a, b) => a.date.localeCompare(b.date)), lastRel = rel.at(-1);
  const expFiles = currentExport().files || [];
  const files = [...fileIds(), ...extraFileList().map((f) => f.id)].map((id) => { const f = FILES.find((x) => x.id === id) || expFiles.find((x) => x.id === id) || EXTRA_FILES.find((x) => x.id === id) || { id, title: id, account: "" }; const copy = !D.files[id] && (id === "plant7_checklist" || id.startsWith("K_")); return { id, title: f.title, account: f.account, loaded: Boolean(D.files[id]) || copy, chars: D.files[id] ? D.files[id].length : copy ? (id === "plant7_checklist" ? 625 : 400) : 0, copy }; });
  const contracts = ["A", "B"].map((a) => { const t = D.records[`${a}:contract.txt`]; if (!t && a === "A") return { account: a, loaded: true, chars: 1215, noAutoRenewal: true, copy: true }; return { account: a, loaded: Boolean(t), chars: t ? t.length : 0, noAutoRenewal: t ? /no automatic renewal/i.test(t) : null }; });
  const searches = Object.entries(D.search).filter(([, v]) => !v.pending).length;
  return { tools, schema, schemaName: sch.title, paperwork, requests: D.requests, requestTotal: D.requestTotal, releases: rel, lastRelease: lastRel || null, team: D.team, whoami: D.whoami, files, contracts, searches, liveTools: tools.filter((t) => t.live).length };
}

function nextStep() {
  const now = Date.now();
  if (!S.accounts) return "accounts";
  if (!S.signals) return "signals";
  if (!S.notes) return "notes";
  if (pendingNewAccounts().length) return "new_account";
  if (S.queue.length) return "write_queued";
  if (S.searchQ.length) return "search";
  if (currentSignals().some((s) => !hasNote(s.id))) return "write_signal_note";
  if (now - S.signalsAt > SIGNALS_EVERY_MS) return "signals";
  if (now - S.accountsAt > ACCOUNTS_EVERY_MS) return "accounts";
  if (dueTool(now)) return "tool";
  return null;
}

export function queueNote(note) { S.queue.push(note); }
export function searchPaperwork(q) {
  q = String(q || "").trim().slice(0, 80); if (!q) return { error: "empty" };
  const hit = S.data.search[q];
  const b = BASE_SEARCH[q.toLowerCase()];
  if (b && !hit) return { q, result: b.rows.map(([account, path, line, text]) => ({ account, path, text: `line ${line}: ${text}` })), total: b.total, copy: true };
  if (hit && !hit.pending && (hit.result || hit.error)) return hit.result ? { q, result: shapeSearch(hit.result) } : { q, error: hit.error };
  if (!hit && !S.searchQ.includes(q)) { S.searchQ.push(q); S.data.search[q] = { at: Date.now(), pending: true }; }
  return { q, pending: true, etaSec: Math.max(1, Math.ceil((S.lastCall + GAP_MS - Date.now()) / 1000)) + (S.searchQ.indexOf(q) > 0 ? 62 * S.searchQ.indexOf(q) : 0) };
}
function shapeSearch(d) {
  const rows = [];
  const w = (o, ctx = {}) => { if (Array.isArray(o)) o.forEach((x) => w(x, ctx)); else if (o && typeof o === "object") { const c = { ...ctx, account: o.account ?? ctx.account, path: o.path ?? ctx.path }; if (o.line != null || o.text != null || o.snippet != null || o.match != null) rows.push({ account: c.account || "", path: c.path || "", text: (o.line != null && o.text != null ? `line ${o.line}: ` : "") + String(o.snippet ?? o.match ?? o.text ?? o.line).slice(0, 220) }); else Object.values(o).forEach((v) => w(v, c)); } };
  w(d); return rows.slice(0, 12);
}

export async function tick() {
  const now = Date.now();
  if (S.busy || now - S.lastCall < GAP_MS || !process.env.AQ_TOKEN) return;
  const step = nextStep();
  if (!step) return;
  S.busy = true; S.lastCall = now;
  try {
    if (step === "accounts") { S.accounts = await call("get_my_accounts"); S.accountsAt = Date.now(); }
    else if (step === "signals") { S.signals = await call("get_signals"); S.signalsAt = Date.now(); }
    else if (step === "notes") { S.notes = await call("list_notes"); S.notesAt = Date.now(); if (!S.notes) S.notes = { notes: [] }; }
    else if (step === "new_account") {
      const id = pendingNewAccounts()[0];
      const d = await call("get_new_account", { account: id });
      if (d && Array.isArray(d.accounts)) S.extra[id] = d; else throw new Error(`get_new_account ${id} returned no account`);
    }
    else if (step === "tool") {
      const [key, name, args] = dueTool(now); S.cyc[key] = Date.now();
      try { ingest(key, name, args, await call(name, args)); } catch (e) { throw e; }
    }
    else if (step === "search") {
      const q = S.searchQ.shift(); S.data.search[q] = { at: Date.now(), pending: true };
      try { const d = await call("search_paperwork", { q }); S.data.search[q] = { at: Date.now(), result: d }; } catch (e) { S.data.search[q] = { at: Date.now(), error: String(e.message || e).slice(0, 120) }; throw e; }
    }
    else if (step === "write_queued") { const n = S.queue.shift(); await call("write_note", n); S.notes = { notes: [...(S.notes?.notes || []), { title: n.title, text: n.text }] }; }
    else if (step === "write_signal_note") {
      const sig = currentSignals().find((s) => !hasNote(s.id));
      const view = getView();
      const risk = view.accounts.flatMap((a) => a.q4).find((r) => r.fromSignal === sig.id);
      const move = view.accounts.flatMap((a) => a.q3).find((m) => m.fromSignal === sig.id);
      const text = `${markerFor(sig.id)} ${sig.title}. ${risk ? "Risk: " + risk.detail : sig.summary} ${move ? "Next step: " + move.title + " (" + move.owner + ", by " + move.due + ")." : ""}`.slice(0, 1500);
      await call("write_note", { account: sig.account, kind: "risk", title: `${markerFor(sig.id)} ${sig.title}`.slice(0, 120), text });
      S.written.add(sig.id);
    }
    S.err = null;
  } catch (e) {
    S.err = { step, message: String(e.message || e).slice(0, 160), status: e.status || null, at: Date.now() };
    if (e.status === 429) S.lastCall = Date.now() + 30_000; // back off a little longer
    if (step === "write_queued") { /* already shifted: drop rather than loop */ }
  } finally { S.busy = false; }
}

export function topMovesNote(account) {
  const a = getView().accounts.find((x) => x.id === account);
  if (!a) return null;
  const top = a.q3.slice(0, 3).map((m) => `${m.rank}. ${m.title} (${m.owner}, by ${m.due})`).join(" ");
  return { account, kind: "next_step", title: `[CRM:top3] ${a.name}: first three moves`, text: `[CRM:top3] ${top}`.slice(0, 1500) };
}
