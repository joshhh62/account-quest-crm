import { queueNote, topMovesNote, tick, getView } from "../lib/sync.js";

export const config = { maxDuration: 30 };

// POST { account: "A" | "B" } queues a note with that account's first three moves; the sync loop
// writes it back to the game with write_note when the one-call-a-minute budget allows.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const account = req.body?.account;
  const note = account ? topMovesNote(account) : null;
  if (!note) { res.status(400).json({ error: "account must be A or B" }); return; }
  queueNote(note);
  await tick();
  res.status(202).json({ queued: true, note: { title: note.title }, status: getView().status });
}
