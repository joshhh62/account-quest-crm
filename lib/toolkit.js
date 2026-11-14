// All 14 MCP tools, what the CRM uses each for, and the data they bring in.
// BASE is the last copy fetched through the MCP; the sync loop replaces it with live results.

export const TOOL_DOCS = [
  { name: "whoami", use: "Change detector: if the game reports more events than we hold, the next call re-reads get_signals." },
  { name: "get_my_accounts", use: "The two accounts: people, facts, deals, offers, deadlines. Everything in the five answers." },
  { name: "get_signals", use: "Live events. Each new one becomes a risk, a move and a note." },
  { name: "list_notes", use: "Stops the CRM writing the same note twice." },
  { name: "write_note", use: "Writes each new event back as a risk with its next step. Also the button for the first three moves." },
  { name: "get_data_format", use: "Schema check: every live export must carry the required fields before it is trusted." },
  { name: "list_paperwork", use: "Index of records per account. Flags paperwork that appeared after the build." },
  { name: "get_all_paperwork", use: "Every record for one account in one call. The source drawer reads these." },
  { name: "get_paperwork_record", use: "Re-reads each contract and compares it with the copy behind the numbers." },
  { name: "get_file", use: "Opens the files the game holds (checklists, letters, ticket history) for the source drawer." },
  { name: "search_paperwork", use: "The search box under the toolkit: find any line in the records." },
  { name: "get_feature_requests", use: "Product requests this account raised and how many other customers want them." },
  { name: "get_release_notes", use: "Dock updates sent overnight. Rules a software update in or out as the cause of a drop." },
  { name: "get_flytbase_team", use: "Who at FlytBase to pull in, with their roles, beside the owner of each move." },
];

export const BASE_NOTE = {
  list_paperwork: "65 records indexed (A 35, B 30), read earlier through the MCP",
  get_all_paperwork: "A: 35 records with full text, read earlier through the MCP",
  get_paperwork_record: "A contract.txt, 1,215 characters, read earlier through the MCP",
  get_file: "plant7_checklist, 625 characters, read earlier through the MCP",
  search_paperwork: 'q="renewal": 29 matching lines, read earlier through the MCP',
  get_data_format: "7 required fields, read earlier through the MCP",
  whoami: "packs open: A, B, read earlier through the MCP",
  get_feature_requests: "31 requests, 3 from your accounts, read earlier through the MCP",
  get_release_notes: "3 releases, latest 2026.09, read earlier through the MCP",
  get_flytbase_team: "7 people, read earlier through the MCP",
};
export const BASE_INDEX = { A: 35, B: 30 };
export const BASE_SEARCH = { renewal: { total: 29, rows: [
  ["A", "calls/2026-01-13_order_call.txt", 11, "- One year, 1 March 2026 to 28 February 2027. No automatic renewal."],
  ["A", "calls/2026-07-22_check_in.txt", 14, "Sam: And the renewal in February, should I expect a process on your side?"],
  ["A", "calls/2026-09-09_check_in.txt", 10, "Sam: The renewal is under six months away. Docks that have never flown will come up in that"],
  ["A", "calls/2026-09-09_check_in.txt", 12, "Rhys: The alliance has the budget. I am not worried about the renewal."],
  ["A", "calls/2026-10-20_check_in.txt", 10, "Sam: Thank you. On the renewal, I will write this month with the term dates so it is in front of"],
  ["A", "calls/2026-10-20_check_in.txt", 18, "- Sam: renewal email with the term dates. Sent 28 October."],
] } };

export const BASE = {
  whoami: { your_morning_over: true, pack: [{ account: "A", open: true }, { account: "B", open: true }], signals: 3 },
  schema: { title: "Account Quest v2 export", required: ["format", "player", "exported_at", "minute", "world_closed", "accounts", "files"], acctRequired: ["id", "name", "stakeholders", "facts", "opportunities", "deadlines"] },
  requests: [
    { id: "FR-011", title: "A monthly summary chart for boards", status: "new", mentions: 18, by: [{ account: "A", who: "Rhys Calder", via: "call, 2 June 2026", date: "2026-06-02" }] },
    { id: "FR-010", title: "Flight reports as a spreadsheet, on a schedule", status: "new", mentions: 16, by: [{ account: "A", who: "Metro Central operations", via: "FB-10781", date: "2026-08-21" }] },
    { id: "FR-002", title: "Copy a patrol schedule from one site to others", status: "under review", mentions: 4, by: [{ account: "B", who: "FlytBase rollout lead, during the rollout", via: "internal", date: "2026-03-17" }] },
  ],
  requestTotal: 31,
  releases: [
    { date: "2026-05-20", version: "2026.05", notes: ["Fixes a delay in live video at night on some docks.", "Minor fixes."] },
    { date: "2026-07-08", version: "2026.07", notes: ["Map layers load faster.", "Minor fixes."] },
    { date: "2026-09-16", version: "2026.09", notes: ["Security and stability fixes."] },
  ],
  team: [
    { id: "sam", name: "Sam", role: "Customer Success Manager (previous CSM on accounts A and B, May to November 2026; has moved teams)" },
    { id: "neel_sharma", name: "Neel Sharma", role: "Lead Customer Success Manager" },
    { id: "achal_negi", name: "Achal Negi", role: "Director of Business Development" },
    { id: "pranjal_suyal", name: "Pranjal Suyal", role: "Lead Solutions Engineer" },
    { id: "srv", name: "SRV", role: "Director of Engineering" },
    { id: "yashash_rao", name: "Yashash Rao", role: "GTM Specialist" },
    { id: "support_desk", name: "Support desk", role: "Shared queue for tickets. Tickets with no assignee wait in the queue." },
  ],
};

const walk = (o, f, k = "") => { if (Array.isArray(o)) o.forEach((x) => walk(x, f, k)); else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) { f(kk, v, o); walk(v, f, kk); } };
export function pathsIn(o) { const out = new Set(); walk(o, (k, v) => { if (k === "path" && typeof v === "string") out.add(v); }); return [...out]; }
export function textOf(x) { return typeof x === "string" ? x : x && typeof x === "object" ? (x.text ?? x.content ?? x.body ?? JSON.stringify(x)) : String(x ?? ""); }

// One-line result per tool for the status table.
export function summarize(name, d) {
  try {
    switch (name) {
      case "whoami": return `morning over: ${d.your_morning_over ? "yes" : "no"} · packs open: ${(d.pack || []).filter((p) => p.open).map((p) => p.account).join(", ")} · events: ${d.signals}`;
      case "get_my_accounts": return `${(d.accounts || []).length} accounts, ${(d.files || []).length} files`;
      case "get_signals": return `${(d.signals || []).length} events`;
      case "list_notes": return `${(d.notes || []).length} notes`;
      case "write_note": return "note saved";
      case "get_data_format": return `required: ${(d.required || []).length} fields`;
      case "list_paperwork": return `${pathsIn(d).length} records indexed`;
      case "get_all_paperwork": return `${pathsIn(d).length} records`;
      case "get_paperwork_record": return `${textOf(d).length} characters`;
      case "get_file": return `${textOf(d).length} characters`;
      case "search_paperwork": return `${pathsIn(d).length || (Array.isArray(d.results) ? d.results.length : 0)} matches`;
      case "get_feature_requests": return `${(d.requests || []).length} requests, ${(d.requests || []).filter((r) => (r.raised_by_your_accounts || []).length).length} from your accounts`;
      case "get_release_notes": return `${(d.releases || []).length} releases, latest ${(d.releases || []).at(-1)?.version}`;
      case "get_flytbase_team": return `${(d.people || []).length} people`;
    }
  } catch { /* fall through */ }
  return "ok";
}
