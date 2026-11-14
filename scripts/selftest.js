import { ACCOUNTS, SIGNALS } from "../lib/baseline.js";
import { buildView } from "../lib/engine.js";
const exp = { exported_at: "2026-11-14T07:49:19Z", accounts: ACCOUNTS };
const view = buildView({ accountsExport: exp, signals: SIGNALS, notes: [], status: {}, baselineSignalIds: SIGNALS.map((s) => s.id) });
const must = (c, m) => { if (!c) { console.error("FAIL:", m); process.exitCode = 1; } };
must(view.asOf === "2026-11-30", "asOf from latest signal, got " + view.asOf);
const A = view.accounts[0], B = view.accounts[1];
must(A.q1.closedTotal === 1700000, "A closed " + A.q1.closedTotal);
must(B.q1.closedTotal === 50000, "B closed " + B.q1.closedTotal);
must(A.q3[0].id === "urgent_request_move", "A top move is Karen reply, got " + A.q3[0].id);
must(B.q3[0].id === "usage_drop_move", "B top move is usage drop, got " + B.q3[0].id);
must(B.q4.some((r) => /AD-02, AD-05, AD-10/.test(r.detail)), "usage risk names AD-02, AD-05, AD-10");
must(A.q4.some((r) => /overdue/.test(r.detail)), "Karen overdue");
must(B.q1.claimsExcluded.some((c) => c.id === "sr_roi_0" && c.contradictedBy === "sr_roi_2"), "ROI claim excluded & contradicted");
for (const a of view.accounts) for (const k of ["q3", "q4", "q5"]) for (const it of a[k]) for (const r of it.refs || []) must(view.sources[r], `unresolved ref ${r} in ${a.id}.${k}`);
for (const a of view.accounts) for (const p of a.q2) for (const rl of Object.values(p.roles)) for (const x of rl) for (const r of x.refs) must(view.sources[r], `unresolved power ref ${r}`);
console.log(JSON.stringify({ asOf: view.asOf, A: { closed: A.q1.closedTotal, top: A.q3.map((m) => [m.rank, m.title.slice(0, 50), m.due, m.daysToDue, m.priority]) }, B: { closed: B.q1.closedTotal, top: B.q3.map((m) => [m.rank, m.title.slice(0, 50), m.due, m.daysToDue, m.priority]) } }, null, 1));

// A signal this build has never seen must still produce a risk, a move and be flagged new.
const synthetic = { id: "new_thing", account: "B", dated: "2026-12-03", title: "Aldermoor: Plant 11 manager wrote in", summary: "A manager wrote to ask whether the dock can be removed.", records: [{ kind: "email", path: "B/emails/x.txt", text: "From: Plant 11 manager\nTo: (the CSM)\nDate: 3 December 2026\nSubject: Dock\n\nCan you tell me this week whether the dock can be taken away?\n" }] };
const v2 = buildView({ accountsExport: exp, signals: [...SIGNALS, synthetic], notes: [], status: {}, baselineSignalIds: SIGNALS.map((s) => s.id) });
const B2 = v2.accounts[1];
must(v2.asOf === "2026-12-03", "asOf moves with new signal");
must(B2.q4.some((r) => r.fromSignal === "new_thing" && r.isNew), "new signal risk present and flagged");
must(B2.q3.some((m) => m.fromSignal === "new_thing"), "new signal move present");
console.log("synthetic signal ok:", B2.q4.filter((r) => r.fromSignal === "new_thing").map((r) => r.title));
