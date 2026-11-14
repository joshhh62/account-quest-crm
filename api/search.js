import { searchPaperwork, tick } from "../lib/sync.js";

export const config = { maxDuration: 30 };

// GET /api/search?q=word. The first ask queues a search_paperwork call (one call a minute per token);
// ask again and the same URL returns the matches once the call has run.
export default async function handler(req, res) {
  const q = String(req.query?.q || "").slice(0, 80);
  const out = searchPaperwork(q);
  await tick();
  const again = searchPaperwork(q);
  res.setHeader("cache-control", "no-store");
  res.status(200).json(again.pending ? again : again.error ? again : again);
}
