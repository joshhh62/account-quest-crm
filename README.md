# Account CRM (Account Quest, build phase)

A live CRM for two accounts: **A, Eastern Counties Police Alliance** and **B, Aldermoor Industrial Group**.
For each account it answers five questions and every number cites the id it came from (a fact id, a file id,
a deal id, or a paperwork path). Click any id chip on the page to read the source text.

1. What is the book worth?  Closed, backed, told-only and claimed values are kept apart. Claims that the data contradicts are left out.
2. Who holds the power?  Per deal: who decides, who pays, who uses it, who could block it. Relationship levels are read live.
3. What do you do first?  Ranked moves with an owner, a due date and the deal each one moves. Ranking is overdue first, then urgency, then money.
4. What is about to go wrong?  Dated risks with when each turns bad.
5. What do you still not know?  Gaps, why they matter and who could fill them.

## How it stays live

- `lib/mcp.js` calls the game's MCP over plain HTTP, **server side only**. The token is read from `AQ_TOKEN`.
- `lib/sync.js` keeps one cached copy per server instance and spends the one-call-a-minute budget in order:
  `get_my_accounts`, `get_signals`, `list_notes`, then `write_note` for any event that has no note yet, then
  `get_signals` again every 90 seconds. The page polls `/api/state` every 20 seconds.
- `lib/engine.js` turns accounts, signals and notes into the five answers. Its signal rules are generic
  (a customer asking for something in writing, a key person leaving, usage that stopped, an ownerless ticket,
  or anything else), so a new event shows up as a new risk, move and gap with no code change.
- `lib/baseline.js` is the last copy of the data fetched through the MCP. It is only a fallback for the
  first paint and for when the MCP is rate limited. The page says "last copy" next to anything not yet live.
- `lib/analysis.js` holds the written judgement (power map, moves, risks, gaps). It cites ids only and
  never stores a relationship level.
- Notes are written back with `write_note` (one per event, titled `[CRM:<event id>]`, and the first three moves on request).

## Run it

```bash
cp .env.example .env     # put your token in AQ_TOKEN (Build screen > Toolkit > Connect). Never commit .env.
node --env-file=.env scripts/dev.js     # http://localhost:3000
node scripts/selftest.js                # checks the engine, including a made-up new event
```

## Deploy

Any host that runs Node 20+ functions works. On Vercel: import the repo, add `AQ_TOKEN` as an environment
variable (mark it sensitive), deploy. `api/state.js` and `api/notes.js` are the only server routes; `public/` is static.

## Limits (what it does not do yet)

- Dock-to-site mapping is not in the data, so per-force and per-plant cost and usage cannot be split.
- A serverless host can run several instances; each keeps its own cache, and the token's one-call-a-minute limit
  is shared, so a busy instance may show "last copy" for a minute while another instance holds the budget.
- The ranking weights are a judgement call and are written in `lib/engine.js` (`priority`).

## All 16 MCP tools

The Toolkit section at the bottom of each account lists every tool, what the CRM uses it for, its last result and how many times it has been called.

| Tool | Used for |
|---|---|
| whoami | Change detector: more events than we hold triggers a fresh get_signals |
| get_my_accounts, get_signals | The five answers and the live events |
| list_notes, write_note | Notes written back once per event, never twice |
| get_data_format | Schema check on every live export |
| list_paperwork | Record index, flags paperwork that appears while the server runs |
| get_all_paperwork, get_paperwork_record | Source drawer reads the live text, contracts are re-read |
| get_file | Opens the game's files for the source drawer |
| search_paperwork | The search box (GET /api/search?q=) |
| get_feature_requests | Product requests this account raised |
| get_release_notes | Rules a dock update in or out as the cause of a usage drop |
| get_flytbase_team | Who to pull in, beside each move owner |

One call a minute covers all of them, so the server rotates through them after the core steps.

## New accounts released during the build
`whoami` lists any account released mid-game (`new_accounts`, `pack`). The server loads it with `get_new_account`, opens its files with `get_new_account_file`, reads its paperwork with `get_all_paperwork`, and the CRM adds a tab for it. Account K (Kestrel Estates) arrived this way. A hand-written layer exists for K; any later account gets the same five answers built from its own facts, deals, offers and deadlines, with unverified claims listed as gaps. No code change is needed to take a new account in.

## Staying fresh without a visitor
The server reads the MCP only while it is awake. A GitHub Action (`.github/workflows/keepalive.yml`) opens `/api/state` every 5 minutes and a daily Vercel cron does the same, so new accounts and signals are picked up with nobody on the page.
