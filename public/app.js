const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SYM = { GBP: "£", EUR: "€" };
const money = (v, cur) => (v == null ? "no value in the data" : `${SYM[cur] || ""}${Number(v).toLocaleString("en-GB")}`);
let view = null, tab = "A", firstLoad = true;
const seenSignals = new Set();

const refs = (ids = []) => ids.map((id) => `<button class="chip" data-ref="${esc(id)}">${esc(id)}</button>`).join("");
const rel = (r) => `<span class="badge rel-${r || "none"}">${r || "not on file"}</span>`;
const sev = (s) => `<span class="badge ${s}">${s}</span>`;

function when(days) {
  if (days == null) return "date not on file";
  if (days < 0) return `<span class="overdue">${-days} day${days === -1 ? "" : "s"} overdue</span>`;
  if (days === 0) return "today";
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

function renderStatus() {
  const s = view.status, el = $("#status");
  const age = (t) => (t ? Math.max(0, Math.round((s.now - t) / 1000)) + "s ago" : "not yet");
  el.innerHTML = `As of <b>${esc(view.asOf)}</b> (latest event on file)<br>
    Accounts <span class="pill ${s.accounts === "live" ? "live" : "base"}">${s.accounts === "live" ? "live" : "last copy"}</span> ${age(s.accountsAt)} ·
    Events <span class="pill ${s.signals === "live" ? "live" : "base"}">${s.signals === "live" ? "live" : "last copy"}</span> ${age(s.signalsAt)}<br>
    Next MCP call in ${Math.ceil(s.nextCallInMs / 1000)}s (one call a minute) ·
    notes written back: ${s.notesWritten.length}${s.error ? `<br><span class="overdue">last MCP error: ${esc(s.error.message)}</span>` : ""}${s.tokenConfigured ? "" : `<br><span class="overdue">AQ_TOKEN is not set on the server</span>`}`;
}

function renderNewBar() {
  const fresh = view.signals.filter((x) => x.isNew && !seenSignals.has(x.id));
  $("#newbar").innerHTML = fresh.length ? `<div class="banner">New since this build: ${fresh.map((f) => esc(f.title)).join(" · ")} (picked up from get_signals, no code change)</div>` : "";
}

function renderTabs() {
  $("#tabs").innerHTML = view.accounts.map((a) => `<button role="tab" data-tab="${a.id}" aria-selected="${a.id === tab}">${esc(a.id)} · ${esc(a.name)}</button>`).join("");
}

function q1(a) {
  const q = a.q1, c = a.currency;
  const row = (r, extra = "") => `<tr><td>${esc(r.title)}<div class="meta">${esc(r.basis || "")}</div></td><td>${esc(r.stage)}</td><td>${money(r.value, c)}</td><td>${refs(r.refs)}</td>${extra}</tr>`;
  const table = (title, rows, note) => rows.length ? `<h3>${title}</h3><p class="meta">${note}</p><table><thead><tr><th>Deal</th><th>Stage</th><th>Value</th><th>Source</th></tr></thead><tbody>${rows.map((r) => row(r)).join("")}</tbody></table>` : "";
  const offers = (xs) => xs.map((o) => `<tr><td>${esc(o.title)}</td><td>${esc(o.pitch_to)}</td><td>${money(o.value, c)}</td><td>${refs([o.id])}</td></tr>`).join("");
  return `
  <div class="grid">
    <div class="stat"><small>Closed (agreed deals and won offers)</small><b>${money(q.closedTotal, c)}</b>${refs([...q.closed.map((x) => x.id), ...q.won.map((x) => x.id)])}</div>
    <div class="stat"><small>Open, backed by verified evidence</small><b>${money(q.backedTotal, c)}</b>${refs(q.backed.map((x) => x.id))}</div>
    <div class="stat"><small>Open, told only (not counted)</small><b>${money(q.unbackedTotal, c)}</b>${refs(q.unbacked.map((x) => x.id))}</div>
    <div class="stat"><small>Offers still open (not counted)</small><b>${money(q.openOffersTotal, c)}</b>${refs(q.openOffers.map((x) => x.id))}</div>
    <div class="stat"><small>Recurring revenue at stake, ends ${esc(q.contract.ends)}</small><b>${money(q.contract.value, c)} a year</b>${refs(q.contract.refs)}</div>
  </div>
  ${q.verifiedBenefit ? `<p><b>Verified benefit:</b> ${esc(q.verifiedBenefit.text)} ${refs(q.verifiedBenefit.refs)} This is more than the ${money(q.contract.value, c)} annual contract, and it is the only saving the customer can show.</p>` : ""}
  ${table("Closed", q.closed, "Agreed in the game. Blocker status is read live.")}
  ${table("Open and backed", q.backed, "Counted because at least one verified fact or file sits behind the deal. The blocker still has to be cleared.")}
  ${table("Open and not backed", q.unbacked, "Only claims or things people told us. Shown apart.")}
  ${table("No value in the data", q.unvalued, "Shown apart on purpose. The renewal value comes from the contract, not from these rows.")}
  ${q.claimsExcluded.length ? `<h3>Claims left out of the numbers</h3>${q.claimsExcluded.map((x) => `<div class="excluded">"${esc(x.text)}" said by ${esc(x.said_by)} ${refs(x.refs)}${x.contradictedBy ? ` <b>Checked against ${esc(x.contradictedBy)}:</b> the supporting spreadsheet counts patrol hours the drones could replace; no guard contract was reduced and finance booked no saving.` : ""}</div>`).join("")}` : ""}
  <h3>Offers</h3><table><thead><tr><th>Offer</th><th>Pitch to</th><th>Value</th><th>Source</th></tr></thead><tbody>
  ${offers(q.won).replace(/<tr>/g, '<tr class="won">')}${offers(q.openOffers)}${offers(q.declinedOffers)}</tbody></table>
  <p class="meta">First rows won, then open, then declined (declined offers are on a cooldown in the game).</p>`;
}

function q2(a) {
  return a.q2.map((d) => `
  <h3>${esc(d.title)} <span class="meta">(${esc(d.stage)})</span></h3><p class="meta">${esc(d.note)}</p>
  <div class="roles">${["decides", "pays", "uses", "blocks"].map((k) => `<div class="role"><h4>${k === "decides" ? "Who decides" : k === "pays" ? "Who pays" : k === "uses" ? "Who uses it" : "Who could block it"}</h4>
    ${d.roles[k].map((p) => `<div class="person"><b>${esc(p.name)}</b> ${rel(p.relationship)}${p.available === false ? ' <span class="badge medium">away</span>' : ""}<div class="meta">${esc(p.why)}</div>${refs(p.refs)}</div>`).join("")}</div>`).join("")}</div>`).join("");
}

function q3(a) {
  const mv = (m, i) => `<div class="move ${i > 2 ? "rest" : ""}"><div class="n">${m.rank}</div><div><b>${esc(m.title)}</b> ${m.fromSignal ? '<span class="badge new">from a live event</span>' : ""}
    <div class="meta">Owner: ${esc(m.owner)} · Due ${esc(m.due)} (${when(m.daysToDue)}) · Moves deal ${refs([m.deal].filter(Boolean))}${m.value ? ` worth up to ${money(m.value, a.currency)}` : ""}</div>
    <div>${esc(m.why)}</div><div>${refs(m.refs)}</div></div></div>`;
  return `<h3>First three moves</h3>${a.q3.slice(0, 3).map((m, i) => mv(m, i)).join("")}
  ${a.q3.length > 3 ? `<h3>Then</h3>${a.q3.slice(3).map((m, i) => mv(m, i + 3)).join("")}` : ""}
  <p><button class="act" data-notes="${a.id}">Write the first three moves back to the game</button> <span class="meta" id="notemsg-${a.id}"></span></p>`;
}

function q4(a) {
  return a.q4.map((r) => `<div class="risk">${sev(r.severity)}${r.isNew ? '<span class="badge new">new</span>' : ""}<b>${esc(r.title)}</b>
    <div class="meta">${r.date ? `Turns bad ${esc(r.date)}: ${when(r.daysTo)}` : "Date not on file"}${r.deal ? ` · deal ${refs([r.deal])}` : ""}</div>
    <div>${esc(r.detail)}</div><div>${refs(r.refs)}</div></div>`).join("");
}

function q5(a) {
  return `<table><thead><tr><th>What we do not know</th><th>Why it matters</th><th>Who could fill it</th><th>Source</th></tr></thead><tbody>${a.q5.map((g) => `<tr><td>${g.isNew ? '<span class="badge new">new</span>' : ""}${esc(g.gap)}</td><td>${esc(g.why)}</td><td>${esc(g.who)}</td><td>${refs(g.refs)}</td></tr>`).join("")}</tbody></table>`;
}

function render() {
  renderStatus(); renderNewBar(); renderTabs();
  const a = view.accounts.find((x) => x.id === tab);
  const sigs = view.signals.filter((s) => s.account === a.id);
  $("#app").innerHTML = `
  <h2>${esc(a.name)} <span class="meta">(account ${esc(a.id)}, ${esc(a.currency)})</span></h2>
  <div class="reality"><b>What the data says:</b> ${esc(a.reality)} ${refs(a.id === "A" ? ["A:usage_weekly.csv"] : ["B:usage_weekly.csv", "sr_roll_0"])}</div>
  ${sigs.length ? `<h3>Live events on this account</h3><div class="sigs">${sigs.map((s) => `<div class="sig">${s.isNew ? '<span class="badge new">new</span>' : ""}<b>${esc(s.title)}</b> <span class="meta">${esc(s.dated)}</span> ${refs([s.id])}<div>${esc(s.summary)}</div></div>`).join("")}</div>` : ""}
  <section class="q"><div class="qn">Question 1</div><h2>What is the book worth?</h2>${q1(a)}</section>
  <section class="q"><div class="qn">Question 2</div><h2>Who holds the power?</h2>${q2(a)}</section>
  <section class="q"><div class="qn">Question 3</div><h2>What do you do first?</h2>${q3(a)}</section>
  <section class="q"><div class="qn">Question 4</div><h2>What is about to go wrong?</h2>${q4(a)}</section>
  <section class="q"><div class="qn">Question 5</div><h2>What do you still not know?</h2>${q5(a)}</section>`;
}

function openRef(id) {
  const s = view.sources[id];
  $("#drawer-body").innerHTML = s ? `<span class="badge new">${esc(s.kind)}</span><h3>${esc(id)}</h3><p><b>${esc(s.label)}</b></p><pre>${esc(s.text)}</pre>` : `<h3>${esc(id)}</h3><p>No source text was returned for this id.</p>`;
  $("#drawer").hidden = false;
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-tab],[data-ref],[data-notes],#drawer-close");
  if (!t) return;
  if (t.dataset.tab) { tab = t.dataset.tab; render(); }
  else if (t.dataset.ref) openRef(t.dataset.ref);
  else if (t.id === "drawer-close") $("#drawer").hidden = true;
  else if (t.dataset.notes) {
    t.disabled = true;
    try {
      const r = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ account: t.dataset.notes }) });
      const j = await r.json();
      const msg = $(`#notemsg-${t.dataset.notes}`);
      if (msg) msg.textContent = r.ok ? "Queued. It is written with write_note when the one-call-a-minute budget allows." : j.error;
    } finally { t.disabled = false; }
  }
});

async function load() {
  try {
    const r = await fetch("/api/state", { cache: "no-store" });
    view = await r.json();
    render();
    if (firstLoad) { view.signals.forEach((s) => { if (!s.isNew) seenSignals.add(s.id); }); firstLoad = false; }
  } catch (err) { $("#status").textContent = "Could not reach the server: " + err.message; }
}
load();
setInterval(load, 20000);
