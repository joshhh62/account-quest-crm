import { mountScene } from "/scene.js";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SYM = { GBP: "£", EUR: "€" };
const money = (v, cur) => (v == null ? "no value in the data" : `${SYM[cur] || ""}${Number(v).toLocaleString("en-GB")}`);
let view = null, tab = "A", firstLoad = true, lastKey = "";
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
  const ok = (k) => `<span class="pill ${k === "live" ? "live" : "base"}">${k === "live" ? "live" : "last copy"}</span>`;
  el.innerHTML = `<span>As of <b>${esc(view.asOf)}</b></span><span>Accounts ${ok(s.accounts)} ${age(s.accountsAt)}</span><span>Events ${ok(s.signals)} ${age(s.signalsAt)}</span><span>Notes written: <b>${s.notesWritten.length}</b></span><span>Tools live: <b>${view.toolkit ? view.toolkit.liveTools : 0}/14</b></span><span>Next call ${Math.ceil(s.nextCallInMs / 1000)}s</span>${s.error ? `<span class="overdue">MCP: ${esc(s.error.message)}</span>` : ""}${s.tokenConfigured ? "" : `<span class="overdue">AQ_TOKEN not set</span>`}`;
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


function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

function hero(a) {
  const q = a.q1, c = a.currency, top = a.q3[0];
  const risk = [...a.q4].filter((r) => r.severity === "high" && r.daysTo != null && r.daysTo >= 0).sort((x, y) => x.daysTo - y.daysTo)[0] || a.q4.find((r) => r.severity === "high") || a.q4[0];
  const left = daysBetween(view.asOf, q.contract.ends);
  const parts = [["Closed", q.closedTotal, "closed"], ["Backed, open", q.backedTotal, "backed"], ["Offers open", q.openOffersTotal, "offers"]];
  const sum = parts.reduce((t, p) => t + p[1], 0) || 1;
  return `<section class="hero" id="brief">
    <div class="hero-h"><span class="qn">Monday briefing</span><h2>${esc(a.name)}</h2></div>
    <div class="hero-grid">
      <div class="hero-card"><small>Book, counted on evidence</small><b>${money(q.closedTotal + q.backedTotal, c)}</b>
        <div class="stack">${parts.map((p) => `<i class="seg ${p[2]}" style="width:${(p[1] / sum) * 100}%" title="${p[0]}: ${money(p[1], c)}"></i>`).join("")}</div>
        <div class="legend">${parts.map((p) => `<span><i class="dot ${p[2]}"></i>${p[0]} ${money(p[1], c)}</span>`).join("")}</div></div>
      <div class="hero-card"><small>Contract at stake</small><b>${money(q.contract.value, c)} a year</b>
        <div class="meta">Ends ${esc(q.contract.ends)} (${left} days from ${esc(view.asOf)}). No automatic renewal.</div>${refs(q.contract.refs)}</div>
      <div class="hero-card"><small>Do this first</small><b class="sm">${esc(top.title)}</b>
        <div class="meta">${esc(top.owner)} · due ${esc(top.due)} (${when(top.daysToDue)})</div></div>
      <div class="hero-card warn"><small>Biggest risk</small><b class="sm">${esc(risk.title)}</b>
        <div class="meta">${risk.date ? esc(risk.date) + " · " + when(risk.daysTo) : "date not on file"}</div>${refs(risk.refs.slice(0, 2))}</div>
    </div>
    <nav class="jump"><a href="#q1">1 Worth</a><a href="#q2">2 Power</a><a href="#q3">3 First moves</a><a href="#q4">4 Going wrong</a><a href="#q5">5 Unknown</a><a href="#q6">Toolkit</a></nav>
  </section>`;
}

function usageChart(a) {
  const m = a.metrics; if (!m) return "";
  const max = Math.max(...m.top4.map((d) => d.flights), 1);
  const rest = m.flights - m.top4.reduce((t, d) => t + d.flights, 0);
  return `<h3>Where the flying happens (${m.weeks} weeks, ${m.flights} flights)</h3>
  <div class="bars">${m.top4.map((d) => `<div class="bar"><span class="bl">${esc(d.dock)}</span><span class="bt"><i style="width:${(d.flights / max) * 100}%"></i></span><span class="bv">${d.flights} <small>(${d.recent} in last 4 wks)</small></span></div>`).join("")}
  <div class="bar rest"><span class="bl">other ${m.docks - 4} docks</span><span class="bt"><i style="width:${(rest / m.docks / max) * 100}%"></i></span><span class="bv">${rest} together, about ${(rest / (m.docks - 4)).toFixed(0)} each</span></div></div>
  <p><b>${m.top4Share}%</b> of flights come from four docks. ${m.never.length ? `Never flew: ${m.never.map((d) => `<span class="chip demo">${esc(d)}</span>`).join(" ")}` : ""} <span class="meta">${m.connectionLosses} connection-lost events.</span> ${refs([a.id + ":usage_weekly.csv"])}</p>`;
}


function ageTxt(sec) { return sec == null ? "not yet this session" : sec < 90 ? `${sec}s ago` : `${Math.round(sec / 60)} min ago`; }

function toolkit(a) {
  const k = view.toolkit; if (!k) return "";
  const mine = (k.requests || []).filter((r) => r.by.some((b) => b.account === a.id));
  const owners = a.q3.map((m) => m.owner).join(" ");
  const pw = k.paperwork && k.paperwork[a.id];
  const con = (k.contracts || []).find((c) => c.account === a.id);
  const files = (k.files || []).filter((f) => f.account === a.id);
  const rel = k.releases || [], last = k.lastRelease;
  let relNote = "";
  if (last && a.id === "B") {
    const gap = Math.round((Date.parse("2026-11-09") - Date.parse(last.date)) / 86400000);
    relNote = `<p class="meta">The three nightly docks flew until the week of 2026-11-09. The last dock update (${esc(last.version)}) went out on ${esc(last.date)}, ${gap} days earlier, so a software update is not the likely cause of the drop.</p>`;
  } else if (last) relNote = `<p class="meta">Latest update ${esc(last.version)} on ${esc(last.date)}. Nothing in the notes touches batteries.</p>`;
  const schema = k.schema.checked ? (k.schema.missing.length || k.schema.acctMissing.length ? `<span class="overdue">missing: ${esc([...k.schema.missing, ...k.schema.acctMissing].join(", "))}</span>` : `<span class="okc">every required field is present</span>`) : "waiting for the first live export";
  return `<section class="q" id="q6"><div class="qn">Toolkit</div><h2>All 14 MCP tools, and what each one does here</h2>
  <p class="meta">${k.liveTools} of 14 have answered live this session. The server spends one call a minute across all of them. Export check against ${esc(k.schemaName || "the schema")} (get_data_format): ${schema}.</p>
  <div class="tk-grid">
    <div class="tk-card"><h4>Product requests from this account <small class="meta">(get_feature_requests)</small></h4>
      ${mine.length ? mine.map((r) => `<div class="tk-row"><b>${esc(r.id)}</b> ${esc(r.title)}<br><span class="meta">${esc(r.status)} · ${esc(r.mentions)} mentions across customers · ${r.by.filter((b) => b.account === a.id).map((b) => esc(b.who) + " (" + esc(b.via) + ")").join("; ")}</span></div>`).join("") : '<p class="meta">None raised by this account.</p>'}
      <p class="meta">${esc(k.requestTotal)} requests in the log. A status is where it sits in the log, not a promise to build it.</p></div>
    <div class="tk-card"><h4>Dock software updates <small class="meta">(get_release_notes)</small></h4>
      ${rel.map((r) => `<div class="tk-row"><b>${esc(r.version)}</b> <span class="meta">${esc(r.date)}</span><br>${esc((r.notes || []).join(" "))}</div>`).join("")}${relNote}</div>
    <div class="tk-card"><h4>FlytBase people to pull in <small class="meta">(get_flytbase_team)</small></h4>
      ${(k.team || []).map((p) => { const on = owners.toLowerCase().includes(String(p.name).toLowerCase()); return `<div class="tk-row${on ? " on" : ""}"><b>${esc(p.name)}</b>${on ? ' <span class="badge new">on a move</span>' : ""}<br><span class="meta">${esc(p.role)}</span></div>`; }).join("")}</div>
    <div class="tk-card"><h4>Records and files <small class="meta">(list_paperwork, get_all_paperwork, get_paperwork_record, get_file)</small></h4>
      <div class="tk-row">${pw ? `<b>${esc(pw.records)}</b> records on file for this account${pw.copy ? " (index read earlier, refreshes live)" : ""}${pw.newSinceStart.length ? `, <span class="overdue">${pw.newSinceStart.length} new since the server started</span>` : ", none new since the server started"}.` : '<span class="meta">Index not read yet.</span>'}</div>
      <div class="tk-row">${con && con.loaded ? `Contract re-read ${con.copy ? 'earlier' : 'live'} (${esc(con.chars)} characters)${con.noAutoRenewal ? ' and it still says <b>no automatic renewal</b>.' : "."}` : '<span class="meta">Contract not re-read yet.</span>'}</div>
      ${files.map((f) => `<div class="tk-row"><span class="chip" data-ref="${esc(f.id)}">${esc(f.id)}</span> ${f.loaded ? `opened ${f.copy ? 'earlier' : 'live'} (${esc(f.chars)} characters)` : '<span class="meta">not opened yet</span>'}</div>`).join("")}</div>
  </div>
  <h3>Search the paperwork <small class="meta">(search_paperwork)</small></h3>
  <form id="searchForm" class="searchf"><input id="searchQ" type="text" maxlength="80" placeholder="e.g. renewal, helicopter, battery" aria-label="Search the paperwork"><button class="act" type="submit">Search</button></form>
  <div id="searchOut" class="meta">The call runs on the one-a-minute budget, so a first search can take up to a minute.</div>
  <h3>Every tool, used live</h3>
  <table><thead><tr><th>Tool</th><th>Used for</th><th>Last result</th><th>Calls</th></tr></thead><tbody>
  ${k.tools.map((t) => `<tr><td><code>${esc(t.name)}</code></td><td>${esc(t.use)}</td><td>${t.ok === false ? `<span class="overdue">${esc(t.err)}</span>` : esc(t.summary)}<br><span class="meta">${esc(ageTxt(t.ago))}</span></td><td>${esc(t.calls)}</td></tr>`).join("")}
  </tbody></table></section>`;
}

function render(animate = true) {
  renderStatus(); renderNewBar(); renderTabs();
  const a = view.accounts.find((x) => x.id === tab);
  const sigs = view.signals.filter((s) => s.account === a.id);
  $("#app").innerHTML = `
  <h2>${esc(a.name)} <span class="meta">(account ${esc(a.id)} · ${esc(a.currency)})</span></h2>
  <div id="scene-mount"></div>
  ${hero(a)}
  <div class="reality"><b>What the data says:</b> ${esc(a.reality)} ${refs(a.id === "A" ? ["A:usage_weekly.csv"] : ["B:usage_weekly.csv", "sr_roll_0"])}</div>
  ${sigs.length ? `<h3>Live events on this account</h3><div class="sigs">${sigs.map((s) => `<div class="sig">${s.isNew ? '<span class="badge new">new</span>' : ""}<b>${esc(s.title)}</b> <span class="meta">${esc(s.dated)}</span> ${refs([s.id])}<div>${esc(s.summary)}</div></div>`).join("")}</div>` : ""}
  <section class="q" id="q1"><div class="qn">Question 1</div><h2>What is the book worth?</h2>${q1(a)}${usageChart(a)}</section>
  <section class="q" id="q2"><div class="qn">Question 2</div><h2>Who holds the power?</h2>${q2(a)}</section>
  <section class="q" id="q3"><div class="qn">Question 3</div><h2>What do you do first?</h2>${q3(a)}</section>
  <section class="q" id="q4"><div class="qn">Question 4</div><h2>What is about to go wrong?</h2>${q4(a)}</section>
  <section class="q" id="q5"><div class="qn">Question 5</div><h2>What do you still not know?</h2>${q5(a)}</section>
  ${toolkit(a)}`;
  mountScene($("#scene-mount"), a, openRef);
  window.__fx && window.__fx.after($("#app"), animate);
}

function openRef(id) {
  const s = view.sources[id];
  $("#drawer-body").innerHTML = s ? `<span class="badge new">${esc(s.kind)}</span><h3>${esc(id)}</h3><p><b>${esc(s.label)}</b></p><pre>${esc(s.text)}</pre>` : `<h3>${esc(id)}</h3><p>No source text was returned for this id.</p>`;
  $("#drawer").hidden = false;
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-tab],[data-ref],[data-notes],#drawer-close");
  if (!t) return;
  if (t.dataset.tab) { tab = t.dataset.tab; render(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
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
    const key = JSON.stringify({ ...view, status: null });
    if (key !== lastKey) { lastKey = key; render(firstLoad); } else { renderStatus(); renderNewBar(); }
    if (firstLoad) { view.signals.forEach((s) => { if (!s.isNew) seenSignals.add(s.id); }); firstLoad = false; }
  } catch (err) { $("#status").textContent = "Could not reach the server: " + err.message; }
}
load();
setInterval(load, 20000);

let searchTimer = 0;
document.addEventListener("submit", (e) => {
  if (e.target.id !== "searchForm") return;
  e.preventDefault();
  const q = $("#searchQ").value.trim(), out = $("#searchOut"); if (!q) return;
  clearTimeout(searchTimer);
  const go = async () => {
    try {
      const r = await fetch("/api/search?q=" + encodeURIComponent(q)).then((x) => x.json());
      if (r.pending) { out.textContent = `Searching for "${q}": the call goes out within about ${r.etaSec}s (one call a minute).`; searchTimer = setTimeout(go, 6000); return; }
      if (r.error) { out.innerHTML = `<span class="overdue">${esc(r.error)}</span>`; return; }
      const rows = r.result || [];
      out.innerHTML = rows.length ? `<b>${r.total || rows.length} lines mention "${esc(q)}"${r.total && r.total > rows.length ? ` (first ${rows.length} shown)` : ""}${r.copy ? ", read earlier through the MCP" : ""}</b>` + rows.map((x) => `<div class="tk-row"><span class="chip" data-ref="${esc((x.account ? x.account + ":" : "") + x.path)}">${esc((x.account ? x.account + ":" : "") + x.path)}</span> ${esc(x.text)}</div>`).join("") : `No line mentions "${esc(q)}".`;
    } catch (err) { out.innerHTML = `<span class="overdue">${esc(err.message)}</span>`; }
  };
  go();
});
