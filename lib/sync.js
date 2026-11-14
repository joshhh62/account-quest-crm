// Keeps one cached copy of the game data per server instance and spends the MCP's
// one-call-a-minute budget in a fixed order: accounts, signals, existing notes, then notes to write.
import { callTool } from "./mcp.js";
import { ACCOUNTS, SIGNALS } from "./baseline.js";
import { buildView } from "./engine.js";

const GAP_MS = 62_000;          // each token gets one call a minute, writes included
const SIGNALS_EVERY_MS = 90_000; // how often we look for new events once everything else is done
const ACCOUNTS_EVERY_MS = 10 * 60_000;

const S = (globalThis.__aq ||= {
  accounts: null, accountsAt: 0, signals: null, signalsAt: 0, notes: null, notesAt: 0,
  lastCall: 0, calls: 0, err: null, queue: [], written: new Set(), busy: false,
});

const BASE_EXPORT = { exported_at: "2026-11-14T07:49:19.019Z", accounts: ACCOUNTS };
const BASE_IDS = SIGNALS.map((s) => s.id);

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
function currentExport() { return Array.isArray(S.accounts?.accounts) ? S.accounts : BASE_EXPORT; }

export function getView() {
  const now = Date.now();
  const view = buildView({ accountsExport: currentExport(), signals: currentSignals(), notes: S.notes?.notes || [], baselineSignalIds: BASE_IDS, status: {} });
  view.status = {
    accounts: S.accounts ? "live" : "baseline", signals: S.signals ? "live" : "baseline",
    accountsAt: S.accountsAt || null, signalsAt: S.signalsAt || null, now,
    nextCallInMs: Math.max(0, S.lastCall + GAP_MS - now), callsThisInstance: S.calls,
    tokenConfigured: Boolean(process.env.AQ_TOKEN), queue: S.queue.length,
    notesWritten: currentSignals().filter((s) => hasNote(s.id)).map((s) => s.id), error: S.err,
  };
  return view;
}

function nextStep() {
  const now = Date.now();
  if (!S.accounts) return "accounts";
  if (!S.signals) return "signals";
  if (!S.notes) return "notes";
  if (S.queue.length) return "write_queued";
  if (currentSignals().some((s) => !hasNote(s.id))) return "write_signal_note";
  if (now - S.signalsAt > SIGNALS_EVERY_MS) return "signals";
  if (now - S.accountsAt > ACCOUNTS_EVERY_MS) return "accounts";
  return null;
}

export function queueNote(note) { S.queue.push(note); }

export async function tick() {
  const now = Date.now();
  if (S.busy || now - S.lastCall < GAP_MS || !process.env.AQ_TOKEN) return;
  const step = nextStep();
  if (!step) return;
  S.busy = true; S.lastCall = now;
  try {
    if (step === "accounts") { S.accounts = await callTool("get_my_accounts"); S.accountsAt = Date.now(); }
    else if (step === "signals") { S.signals = await callTool("get_signals"); S.signalsAt = Date.now(); }
    else if (step === "notes") { S.notes = await callTool("list_notes"); S.notesAt = Date.now(); if (!S.notes) S.notes = { notes: [] }; }
    else if (step === "write_queued") { const n = S.queue.shift(); await callTool("write_note", n); S.notes = { notes: [...(S.notes?.notes || []), { title: n.title, text: n.text }] }; }
    else if (step === "write_signal_note") {
      const sig = currentSignals().find((s) => !hasNote(s.id));
      const view = getView();
      const risk = view.accounts.flatMap((a) => a.q4).find((r) => r.fromSignal === sig.id);
      const move = view.accounts.flatMap((a) => a.q3).find((m) => m.fromSignal === sig.id);
      const text = `${markerFor(sig.id)} ${sig.title}. ${risk ? "Risk: " + risk.detail : sig.summary} ${move ? "Next step: " + move.title + " (" + move.owner + ", by " + move.due + ")." : ""}`.slice(0, 1500);
      await callTool("write_note", { account: sig.account, kind: "risk", title: `${markerFor(sig.id)} ${sig.title}`.slice(0, 120), text });
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
