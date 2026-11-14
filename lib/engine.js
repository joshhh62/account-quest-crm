// Turns MCP data (accounts, signals, notes) into the five answers for each account.
// Pure functions: same input, same output. No network here.
import { METRICS, SOURCES, FILES } from "./baseline.js";
import { POWER, MOVES, RISKS, GAPS, PLAYBOOK } from "./analysis.js";

const DAY = 86400000;
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const iso = (d) => new Date(d).toISOString().slice(0, 10);
const addDays = (s, n) => iso(Date.parse(s + "T00:00:00Z") + n * DAY);
const diffDays = (a, b) => Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / DAY);
const REL_RANK = { guarded: 0, neutral: 1, warm: 2, ally: 3 };

// ---------- helpers ----------
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const head = lines[0].split(",");
  return lines.slice(1).map((l) => {
    const cells = []; let cur = "", q = false;
    for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch; }
    cells.push(cur);
    return Object.fromEntries(head.map((h, i) => [h, cells[i]]));
  });
}

function parseEmail(text) {
  const g = (k) => (text.match(new RegExp(`^${k}:\\s*(.*)$`, "mi")) || [])[1];
  return { from: g("From"), date: g("Date"), subject: g("Subject"), body: text.split(/\n\n/).slice(1).join("\n\n") };
}

function dateFromText(text, fallbackYear) {
  const m = text.toLowerCase().match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join("|")})(?:\\s+(\\d{4}))?`));
  if (!m) return null;
  const y = m[3] || fallbackYear;
  return `${y}-${String(MONTHS.indexOf(m[2]) + 1).padStart(2, "0")}-${String(+m[1]).padStart(2, "0")}`;
}

// Friday of the week containing an ISO date (for "settled this week").
function endOfWeek(s) {
  const d = new Date(s + "T00:00:00Z"); const dow = d.getUTCDay(); // 0 Sun
  const toFri = dow === 0 ? -2 : 5 - dow;
  return addDays(s, toFri);
}

export function asOfDate(accountsExport, signals) {
  const dates = (signals || []).map((s) => s.dated).filter(Boolean);
  const exported = accountsExport?.exported_at ? accountsExport.exported_at.slice(0, 10) : null;
  return [exported, ...dates].filter(Boolean).sort().pop() || iso(Date.now());
}

function priority(move, asOf) {
  const d = diffDays(move.due, asOf);
  const urgency = d < 0 ? 100 + Math.min(-d, 30) : Math.max(0, 70 - d * 4);
  const money = Math.log10((move.value || 0) + 10) * 6;
  return Math.round((urgency + money + (move.weight || 0)) * 10) / 10;
}

// ---------- signal rules (generic: they work for signals this build has never seen) ----------
function usageFinding(records, acct) {
  const rec = records.find((r) => r.kind === "usage" && r.text);
  if (!rec) return null;
  const rows = parseCsv(rec.text).map((r) => ({ week: r.week_start, dock: r.dock_id, flights: +r.flights, online: +r.days_online }));
  const weeks = [...new Set(rows.map((r) => r.week))].sort();
  if (weeks.length < 3) return null;
  const half = Math.floor(weeks.length / 2);
  const early = weeks.slice(0, half), late = weeks.slice(half);
  const per = {};
  for (const r of rows) { const p = (per[r.dock] ||= { early: 0, late: 0, online: 0, n: 0 }); (early.includes(r.week) ? (p.early += r.flights) : (p.late += r.flights)); p.online += r.online; p.n += 7; }
  const stopped = Object.entries(per).filter(([, p]) => p.early >= 8 && p.late === 0).map(([d, p]) => ({ dock: d, before: p.early, after: p.late, online: p.online + "/" + p.n }));
  const steady = Object.entries(per).filter(([, p]) => p.early >= 8 && p.late >= 8).map(([d, p]) => ({ dock: d, before: p.early, after: p.late }));
  return { path: rec.path, early, late, stopped, steady, rows: rows.length };
}

function requestFindings(records) {
  const out = [];
  for (const rec of records.filter((r) => r.kind === "request" && r.text))
    for (const row of parseCsv(rec.text)) out.push({ id: row.request_id, opened: row.opened, from: row.from, summary: row.summary, status: row.status, owner: row.owner, path: rec.path });
  return out;
}

export function processSignal(sig, asOf, known) {
  const a = sig.account;
  const isNew = !known.has(sig.id);
  const play = PLAYBOOK[sig.id];
  const risks = [], moves = [], gaps = [];
  const emails = (sig.records || []).filter((r) => r.kind === "email" && r.text).map((r) => ({ ...parseEmail(r.text), path: r.path }));
  const reqs = requestFindings(sig.records || []);
  const usage = usageFinding(sig.records || [], a);
  const lower = `${sig.title} ${sig.summary}`.toLowerCase();
  const year = sig.dated.slice(0, 4);
  const refs = [sig.id, ...(sig.records || []).map((r) => r.path)];

  // 1. A customer asked for something in writing.
  for (const e of emails.filter((e) => /need|settled|please|can you|when can/i.test(e.body) && !/moving to another role/i.test(e.body))) {
    const ask = /this week/i.test(e.body) ? endOfWeek(sig.dated) : addDays(sig.dated, 3);
    const event = dateFromText(e.body, year);
    const overdue = diffDays(asOf, ask);
    const ticket = reqs[0];
    risks.push({
      id: `${sig.id}_unanswered`, title: `${e.from} asked for a written answer and none is on file`,
      date: ask, severity: "high", deal: play?.move?.deal || null,
      detail: `${e.subject} (${e.date}). Asked for an answer ${/this week/i.test(e.body) ? "this week, by " + ask : "by " + ask}${event ? "; the public event is on " + event : ""}. ${overdue > 0 ? `That is ${overdue} day${overdue === 1 ? "" : "s"} overdue as of ${asOf}.` : `Due in ${-overdue} day(s).`}${ticket ? ` Ticket ${ticket.id} is ${ticket.status.toLowerCase()} with ${ticket.owner ? "owner " + ticket.owner : "no owner"}.` : ""}`,
      refs,
    });
    if (event) risks.push({ id: `${sig.id}_event`, title: `Public event on ${event} depends on the reply`, date: event, severity: "high", deal: play?.move?.deal || null, detail: `${e.from} wants the docks to carry more of the day. Two things must be settled in writing first: operator training dates and cover if a dock fails.`, refs });
  }

  // 2. A key person is leaving.
  if (/moving on|leaves|leaving|moving to another role|successor/.test(lower)) {
    risks.push({ id: `${sig.id}_keyperson`, title: "Single point of contact is leaving with no successor named", date: null, severity: "high", deal: play?.move?.deal || null, detail: sig.summary, refs });
    gaps.push({ gap: "Who takes over from the departing contact", why: "Everything on file runs through one person and the handover is not named.", who: "The departing contact; the programme office", refs });
  }

  // 3. Usage dropped.
  if (usage && usage.stopped.length) {
    const names = usage.stopped.map((s) => s.dock).join(", ");
    const keep = usage.steady.map((s) => s.dock).join(", ");
    risks.push({
      id: `${sig.id}_usage`, title: `${usage.stopped.length} docks that flew most nights flew nothing for ${usage.late.length} weeks`, date: usage.late[0], severity: "high", deal: play?.move?.deal || null,
      detail: `${names}: ${usage.stopped.map((s) => `${s.dock} ${s.before} flights in the weeks of ${usage.early.join(" and ")}, ${s.after} after`).join("; ")}. All stayed online (${usage.stopped[0].online} days). ${keep ? `${keep} kept flying.` : ""} No ticket and nobody at the customer has said anything, so the cause is unknown.`,
      refs,
    });
    gaps.push({ gap: `Why ${names} stopped flying`, why: "Online but idle with no ticket: the cause (network, guard contract, plant decision) is unconfirmed.", who: "Plant managers; group IT", refs });
  }

  // 4. A support request has no owner.
  for (const r of reqs.filter((r) => !r.owner && /open/i.test(r.status))) {
    risks.push({ id: `${sig.id}_${r.id}`, title: `Ticket ${r.id} is open with no owner`, date: r.opened, severity: "medium", deal: play?.move?.deal || null, detail: `${r.from}: ${r.summary}`, refs: [r.path, sig.id] });
  }

  // 5. Fallback so a brand-new kind of signal is never silently dropped.
  if (!risks.length) risks.push({ id: `${sig.id}_new`, title: sig.title, date: sig.dated, severity: "medium", deal: null, detail: sig.summary, refs });

  // Moves: playbook wording when we know the signal, otherwise a generic triage move.
  if (play?.move) {
    const m = play.move;
    moves.push({ id: `${sig.id}_move`, ...m, due: m.due || addDays(asOf > sig.dated ? asOf : sig.dated, m.daysAfter ?? 2), refs: [...(m.refs || []), ...refs], fromSignal: sig.id });
  } else {
    moves.push({ id: `${sig.id}_move`, title: `Triage: ${sig.title}`, deal: null, owner: "You", due: addDays(asOf, 2), value: 0, weight: 3, why: sig.summary, refs, fromSignal: sig.id });
  }
  return { id: sig.id, account: a, dated: sig.dated, title: sig.title, summary: sig.summary, isNew, risks, moves, gaps, usage };
}

// ---------- the five answers ----------
function indexFacts(acct) { return Object.fromEntries(acct.facts.map((f) => [f.id, f])); }
const fileIdx = Object.fromEntries(FILES.map((f) => [f.id, f]));

function metricsFor(id) {
  const m = METRICS[id];
  const per = m.perDock.split(" ").map((s) => { const [d, v] = s.split(":"); const [all, rec] = v.split("/"); return { dock: m.prefix + d, flights: +all, recent: +rec }; });
  const top = [...per].sort((a, b) => b.flights - a.flights);
  const never = per.filter((p) => p.flights === 0).map((p) => p.dock);
  const top4 = top.slice(0, 4);
  return { ...m, per, never, top4, top4Share: Math.round((top4.reduce((s, p) => s + p.flights, 0) / m.flights) * 100) };
}

function answerQ1(acct, facts) {
  const closed = [], backed = [], unbacked = [], unvalued = [];
  for (const o of acct.opportunities) {
    const ev = o.evidence.map((id) => ({ id, fact: facts[id], file: fileIdx[id] }));
    const verified = ev.filter((e) => e.file || e.fact?.status === "verified").map((e) => e.id);
    const told = ev.filter((e) => e.fact?.status === "told").map((e) => e.id);
    const claims = ev.filter((e) => e.fact?.status === "claim").map((e) => e.id);
    const row = { id: o.id, title: o.title, stage: o.stage, value: o.worth_up_to, blocker: o.blocker, verified, told, claims, refs: [o.id, ...verified] };
    if (o.stage === "agreed") closed.push({ ...row, basis: "Agreed in principle in the game. Blocker: " + (o.blocker ? o.blocker.status : "none") + "." });
    else if (o.worth_up_to == null) unvalued.push({ ...row, basis: "No value in the data. Shown apart, not added to the total." });
    else if (verified.length) backed.push({ ...row, basis: `Supported by ${verified.length} verified item(s). Blocker ${o.blocker ? o.blocker.status : "none"}: ${o.blocker?.text || ""}` });
    else unbacked.push({ ...row, basis: "Only what people told us, or claims. Not counted." });
  }
  const won = acct.offers.filter((x) => x.status === "won"), open = acct.offers.filter((x) => x.status === "open"), lost = acct.offers.filter((x) => x.status === "declined");
  const sum = (xs, k) => xs.reduce((s, x) => s + (x[k] || 0), 0);
  const claimsExcluded = acct.facts.filter((f) => f.status === "claim" && /\d/.test(f.text)).map((f) => {
    const contradict = acct.facts.find((g) => g.status === "verified" && g.said_by === f.said_by && f.id.split("_")[1] === g.id.split("_")[1]);
    return { id: f.id, text: f.text, said_by: f.said_by, contradictedBy: contradict?.id, refs: [f.id, ...(contradict ? [contradict.id] : [])] };
  });
  const contract = acct.id === "A"
    ? { value: 350000, ends: "2027-02-28", docks: 35, refs: ["A:contract.txt", "A:deal_history.json"] }
    : { value: 140000, ends: "2027-01-31", docks: 14, refs: ["B:contract.txt", "B:deal_history.json"] };
  const verifiedBenefit = acct.id === "B" ? { value: 180000, text: "Insurer premium cut, about 180,000 euros a year across nine plants. The only hard financial benefit on file.", refs: ["jt_prem_2", "insurer_premium_letter"] } : null;
  return {
    currency: acct.currency, closedTotal: sum(closed, "value") + sum(won, "value"), closed, won,
    backed, backedTotal: sum(backed, "value"), unbacked, unbackedTotal: sum(unbacked, "value"), unvalued,
    openOffers: open, openOffersTotal: sum(open, "value"), declinedOffers: lost, claimsExcluded, contract, verifiedBenefit,
  };
}

function answerQ2(acct) {
  const byId = Object.fromEntries(acct.stakeholders.map((s) => [s.id, s]));
  return (POWER[acct.id] || []).map((p) => {
    const opp = acct.opportunities.find((o) => o.id === p.deal);
    const roles = Object.fromEntries(Object.entries(p.roles).map(([k, arr]) => [k, arr.map((r) => {
      const s = r.id ? byId[r.id] : null;
      return { name: s ? s.name : r.label, id: r.id, role: s?.role || null, relationship: s ? s.relationship : null, available: s ? s.available : null, why: r.why, refs: r.refs };
    })]));
    return { deal: p.deal, title: opp?.title || p.deal, stage: opp?.stage, note: p.note, roles };
  });
}

const CUR = { A: "GBP", B: "EUR" };
const withCur = (exp) => ({ ...exp, accounts: exp.accounts.map((x) => ({ ...x, currency: x.currency || CUR[x.id] || "" })) });

export function buildView({ accountsExport: rawExport, signals, notes, status, baselineSignalIds }) {
  const accountsExport = withCur(rawExport);
  const asOf = asOfDate(accountsExport, signals);
  const known = new Set(baselineSignalIds);
  const processed = signals.map((s) => processSignal(s, asOf, known));
  const accounts = accountsExport.accounts.map((acct) => {
    const facts = indexFacts(acct);
    const sig = processed.filter((p) => p.account === acct.id);
    const q1 = answerQ1(acct, facts);
    const mt = metricsFor(acct.id);
    const moves = [...(MOVES[acct.id] || []).map((m) => ({ ...m })), ...sig.flatMap((p) => p.moves)]
      .map((m) => ({ ...m, priority: priority(m, asOf), daysToDue: diffDays(m.due, asOf) }))
      .sort((a, b) => b.priority - a.priority).map((m, i) => ({ ...m, rank: i + 1 }));
    const risks = [...(RISKS[acct.id] || []), ...sig.flatMap((p) => p.risks.map((r) => ({ ...r, fromSignal: p.id, isNew: p.isNew })))]
      .map((r) => ({ ...r, daysTo: r.date ? diffDays(r.date, asOf) : null }))
      .sort((a, b) => (a.date && b.date ? a.date.localeCompare(b.date) : a.date ? -1 : b.date ? 1 : 0));
    // Dynamic gaps from live state: blockers still open, people who are away, anyone we have not met.
    const live = [];
    for (const o of acct.opportunities) if (o.blocker && o.blocker.status !== "cleared") live.push({ gap: `Open blocker on "${o.title}": ${o.blocker.text}`, why: "The deal cannot move until it is cleared.", who: "See the power map for this deal", refs: [o.id] });
    for (const s of acct.stakeholders) if (s.available === false) live.push({ gap: `${s.name} is away`, why: `${s.role}: cannot be asked directly right now, and ${s.relationship} with you.`, who: "A deputy or the colleague who works with them", refs: [s.id] });
    const gaps = [...(GAPS[acct.id] || []), ...sig.flatMap((p) => p.gaps.map((g) => ({ ...g, fromSignal: p.id, isNew: p.isNew }))), ...live];
    return {
      id: acct.id, name: acct.name, currency: acct.currency, official_story: acct.official_story,
      reality: realityCheck(acct, mt), q1, q2: answerQ2(acct), q3: moves, q4: risks, q5: gaps,
      stakeholders: acct.stakeholders, offers: acct.offers, metrics: { docks: mt.docks, flights: mt.flights, never: mt.never, top4Share: mt.top4Share, top4: mt.top4, weeks: mt.weeks, connectionLosses: mt.connectionLosses },
    };
  });
  return {
    asOf, accounts,
    signals: processed.map((p) => ({ id: p.id, account: p.account, dated: p.dated, title: p.title, summary: p.summary, isNew: p.isNew, usage: p.usage })),
    sources: collectSources(accountsExport, signals),
    notes: notes || [], status,
  };
}

function realityCheck(acct, m) {
  if (acct.id === "A") return `${m.docks} docks paid for, ${m.flights} flights in ${m.weeks} weeks, ${m.never.length} docks never flew (${m.never.map((d) => d.replace("ECPA-", "")).join(", ")}). Official story: "${acct.official_story}"`;
  return `${m.docks} docks paid for, ${m.flights} flights in ${m.weeks} weeks, and ${m.top4.length} docks (${m.top4.map((d) => d.dock).join(", ")}) did ${m.top4Share}% of them. Stefan reports "13 of 15 plants flying". Official story: "${acct.official_story}"`;
}

function collectSources(accountsExport, signals) {
  const out = {};
  for (const [k, v] of Object.entries(SOURCES)) out[k] = { kind: "paperwork", label: v.title, text: v.text };
  for (const f of FILES) out[f.id] = { kind: "file", label: `File: ${f.title}`, text: `Game file ${f.path} (account ${f.account}). Open with get_file("${f.id}").` };
  for (const a of accountsExport.accounts) {
    for (const f of a.facts) out[f.id] = { kind: "fact", label: `${f.said_by} (${f.status}${f.verified_by ? ", verified by " + f.verified_by : ""})`, text: f.text };
    for (const o of a.opportunities) out[o.id] = { kind: "deal", label: `Deal ${o.id}`, text: `${o.title}. Stage: ${o.stage}. ${o.worth_up_to != null ? "Worth up to " + o.worth_up_to.toLocaleString("en-GB") + " " + a.currency + "." : "No value in the data."}${o.blocker ? " Blocker (" + o.blocker.status + "): " + o.blocker.text + "." : ""}` };
    for (const s of a.stakeholders) out[s.id] = { kind: "person", label: s.name, text: `${s.role}. Relationship: ${s.relationship}.${s.available === false ? " Away." : ""}` };
  }
  for (const s of signals) {
    out[s.id] = { kind: "signal", label: `Signal ${s.dated}`, text: `${s.title}. ${s.summary}` };
    for (const r of s.records || []) out[r.path] = { kind: "record", label: r.path, text: (r.text || "").slice(0, 900) };
  }
  return out;
}
