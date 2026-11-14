import { tick, getView } from "../lib/sync.js";

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  await tick();
  res.setHeader("cache-control", "no-store");
  res.status(200).json(getView());
}
