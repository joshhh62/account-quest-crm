// Curated judgement layer. Everything here cites ids that exist in the MCP data (facts, files,
// opportunities) or paperwork paths listed in baseline.SOURCES. Relationship levels are never
// written here: the engine reads them live from get_my_accounts.

const D = (s) => s; // ISO date strings, for readability

export const POWER = {
  A: [
    {
      deal: "a_tender", note: "Procurement runs a formal process. A force's call-off needs its own finance sign-off, so winning the tender is not a sale.",
      roles: {
        decides: [{ id: "hannah_doyle", why: "Runs the alliance procurement process and the evaluation weights (40% on cost per flight + operating model).", refs: ["hd_weights_1", "hd_window_2"] }],
        pays: [{ id: null, label: "Each force's chief finance officer (not named on file)", why: "No pooled budget; every call-off needs that force's CFO.", refs: ["rc_funding_2", "hd_calloff_2"] }],
        uses: [{ id: "karen_mbeki", why: "Westmere would fly the docks. Scaling to 30 needs nine more trained operators.", refs: ["km_staff_2"] }],
        blocks: [{ id: "rhys_calder", why: "Controls the channel, said 'the alliance has the budget' (a claim), and is leaving in January.", refs: ["rc_funding_0", "champion_leaves"] }],
      },
    },
    {
      deal: "a_tarn", note: "Cleared once engineering delivered the data-flow pack. Fatima Osei decides when the DPIA is signed.",
      roles: {
        decides: [{ id: "fatima_osei", why: "Signs the DPIA. With flows, retention, storage and access she can finish in three weeks.", refs: ["fo_needs_3"] }],
        pays: [{ id: null, label: "Tarn Valley and Norwold finance (not named on file)", why: "No finance contact on file at either force.", refs: ["A:profile.json"] }],
        uses: [{ id: null, label: "Tarn Valley and Norwold operators (not named on file)", why: "Tarn Valley has never flown a live mission; Norwold only trains.", refs: ["rc_appetite_2"] }],
        blocks: [{ id: "fatima_osei", why: "Blocker was the unanswered data-flow request. Status is read live from the opportunity.", refs: ["pj_ticket", "srv_dataflow"] }],
      },
    },
    {
      deal: "a_westmere", note: "Karen wants to scale. Ewan's CFO will not sign without a cost per flight set against helicopter hours.",
      roles: {
        decides: [{ id: null, label: "Metro Central chief finance officer (not named on file)", why: "Signs a call-off only against a cost per flight vs helicopter hours.", refs: ["eb_sign_2"] }],
        pays: [{ id: "ewan_brooks", why: "Finance partner who prepares the case; helicopter hour is about 1,500 pounds all-in (verified).", refs: ["eb_heli_1"] }],
        uses: [{ id: "karen_mbeki", why: "Wants docks to carry more of the 5 December event; short of trained operators.", refs: ["km_staff_2", "urgent_request"] }],
        blocks: [{ id: "ewan_brooks", why: "No drone cost figure: operator overtime is not tracked separately. He could pull it in a week.", refs: ["eb_drone_2", "helicopter_cost_overtime"] }],
      },
    },
    {
      deal: "a_renewal", note: "350,000 a year, no automatic renewal, term ends 28 Feb 2027. Rhys says it will go through; he is leaving.",
      roles: {
        decides: [{ id: null, label: "Alliance office signer (not named on file)", why: "The alliance office signed the order. Rhys: 'send it to the programme office'.", refs: ["A:contract.txt", "A:emails/2026-10-28_renewal.txt"] }],
        pays: [{ id: null, label: "Four forces, invoiced in four parts (Schedule 2, held by Accounts)", why: "Schedule 2 was never copied to customer success.", refs: ["A:contract.txt"] }],
        uses: [{ id: "karen_mbeki", why: "Heaviest day-to-day user (62 sign-ins in 90 days vs Rhys 9).", refs: ["A:users.json"] }],
        blocks: [{ id: "rhys_calder", why: "Sole channel; leaves January with no named successor.", refs: ["champion_leaves"] }],
      },
    },
  ],
  B: [
    {
      deal: "b_renewal", note: "140,000 euros a year, no automatic renewal, term ends 31 Jan 2027. Group finance wants a quote by plant; Stefan calls the renewal a formality.",
      roles: {
        decides: [{ id: "stefan_roy", why: "Signed the order and calls renewal a formality, but is away and will not involve finance.", refs: ["B:calls/2026-10-13_check_in.txt", "B:contract.txt"] }],
        pays: [{ id: "nadia_rahman", why: "Group finance controller. Plants pay a share of the security budget; the order form does not say how the cost is split.", refs: ["sr_plants_2", "B:contract.txt"] }],
        uses: [{ id: "beatriz_alonso", why: "Plant 7 flies nightly; alerts go to her phone.", refs: ["ba_use_2"] }],
        blocks: [{ id: null, label: "Group finance shared mailbox (unnamed)", why: "Asked for a per-plant quote on 8 Oct. No reply on file.", refs: ["B:emails/2026-10-08_finance_mailbox.txt"] }],
      },
    },
    {
      deal: "b_idle", note: "Idle plants need an owner for adoption and a network that stays up.",
      roles: {
        decides: [{ id: "stefan_roy", why: "Group head of security sets the programme.", refs: ["sr_repl_2"] }],
        pays: [{ id: null, label: "Individual plant managers", why: "Several resent paying for equipment they did not choose.", refs: ["sr_plants_2"] }],
        uses: [{ id: null, label: "Plant 11 manager (unnamed)", why: "Sees the dock as head office's toy; network is poor.", refs: ["ba_other_1", "B:requests.csv"] }],
        blocks: [{ id: "owen_fitch", why: "Group IT: the network project will cut the docks off; FB-10903 has waited on IT since September.", refs: ["B:requests.csv"] }],
      },
    },
    {
      deal: "b_insurance", note: "The only hard financial benefit: premiums cut by 6% across nine plants.",
      roles: {
        decides: [{ id: "julian_tate", why: "Insurance and risk manager; the insurer reviews in about five months.", refs: ["jt_review_2", "jt_prem_2"] }],
        pays: [{ id: "nadia_rahman", why: "Finance books the premium; no drone saving has been booked.", refs: ["sr_roi_2"] }],
        uses: [{ id: "beatriz_alonso", why: "Consistent flight logs by plant need plant-level operators.", refs: ["jt_review_2"] }],
        blocks: [{ id: null, label: "Plants with idle docks", why: "Idle docks put the discount at risk.", refs: ["jt_review_2", "B:usage_weekly.csv"] }],
      },
    },
    {
      deal: "b_sister", note: "Needs figures that can be stood behind and a plant willing to be quoted.",
      roles: {
        decides: [{ id: null, label: "Sister company (no contact on file)", why: "40 plants watching; nobody named.", refs: ["B:deal_history.json"] }],
        pays: [{ id: null, label: "Not known", why: "No commercial discussion on file.", refs: ["B:deal_history.json"] }],
        uses: [{ id: "beatriz_alonso", why: "Willing to share her Plant 7 checklist.", refs: ["ba_playbook_2", "plant7_checklist"] }],
        blocks: [{ id: "stefan_roy", why: "Wants the 1.2 million headline; marketing will not publish it without working.", refs: ["sr_roi_0", "sr_roi_2"] }],
      },
    },
  ],
};

// Persistent moves (independent of any live signal). due is an ISO date. weight breaks ties.
export const MOVES = {
  A: [
    {
      id: "a_cost_per_flight", title: "Build the cost-per-flight comparison with Ewan's drone overtime", deal: "a_westmere",
      owner: "You, with Ewan Brooks", due: D("2026-12-08"), value: 250000, weight: 6,
      why: "His CFO signs only against a cost per flight set against helicopter hours. The helicopter side is verified at about 1,500 pounds an hour; the drone side is missing and Ewan can pull it in a week. Unblocks Westmere (250,000) and re-opens the declined 180,000 docks offer.",
      refs: ["eb_sign_2", "eb_heli_1", "eb_drone_2", "helicopter_cost_overtime"],
    },
    {
      id: "a_tender_followthrough", title: "Keep the tender position alive in the formal window", deal: "a_tender",
      owner: "You, with Hannah Doyle", due: D("2026-12-11"), value: 1500000, weight: 5,
      why: "The tender weights cost per flight and the operating model at 40%. Procurement asked to be kept informed and nobody owned that; send specific written questions through the clarification route only.",
      refs: ["hd_weights_1", "hd_window_2", "A:calls/2025-12-16_pilot_review.txt", "clarification_template"],
    },
  ],
  B: [
    {
      id: "b_capture_rollout", title: "Get the install list and the deputy's rollout playbook written down", deal: "b_idle",
      owner: "You, with Beatriz Alonso (intro) and Stefan Roy's deputy", due: D("2026-12-04"), value: 180000, weight: 8,
      why: "The deputy set up most docks, keeps the only install list (never delivered) and is leaving; the know-how is lost unless it is written down first. Without the list nobody can say which dock sits at which plant, so per-plant cost and usage cannot be answered.",
      refs: ["sr_repl_2", "ba_deputy_0", "B:calls/2026-04-23_rollout_close.txt", "B:profile.json"],
    },
    {
      id: "b_finance_reply", title: "Answer Group Finance with a per-plant renewal view", deal: "b_renewal",
      owner: "You, with Nadia Rahman and FlytBase Accounts", due: D("2026-12-07"), value: 140000, weight: 7,
      why: "Group finance asked on 8 Oct for the renewal quote by plant. It is unanswered and Stefan said to ignore it. The term ends 31 Jan 2027 and a new order is needed; leave out the 1.2 million claim and show the verified 180,000 euro premium cut instead.",
      refs: ["B:emails/2026-10-08_finance_mailbox.txt", "B:contract.txt", "jt_prem_2", "sr_roi_2"],
    },
    {
      id: "b_insurer_logs", title: "Start consistent flight logs by plant for the insurer's review", deal: "b_insurance",
      owner: "You, with Julian Tate", due: D("2026-12-18"), value: 90000, weight: 4,
      why: "The insurer reviews in about five months; consistent logs by plant extend the 6% cut, idle docks put it at risk. Only 4 of 14 docks fly regularly (AD-02, AD-05, AD-08, AD-10).",
      refs: ["jt_review_2", "jt_prem_2", "B:usage_weekly.csv"],
    },
  ],
};

// Persistent risks. date = when it turns bad (ISO) or null if the date is not on file.
export const RISKS = {
  A: [
    { id: "a_renewal_end", title: "Contract ends with no automatic renewal", date: D("2027-02-28"), severity: "high", deal: "a_renewal", detail: "A new order is needed before the term ends. 350,000 a year.", refs: ["A:contract.txt", "A:deal_history.json"] },
    { id: "a_dead_docks", title: "Seven of the 35 docks have never flown", date: null, severity: "medium", deal: "a_renewal", detail: "ECPA-D09, D11, D15, D18, D23, D25 and D35 have zero flights in 27 weeks. Rhys says all four forces are keen; only Westmere and Metro Central fly operationally.", refs: ["A:usage_weekly.csv", "rc_appetite_0", "rc_appetite_2"] },
    { id: "a_batteries", title: "Westmere's batteries are wearing out and nobody answered", date: null, severity: "medium", deal: "a_westmere", detail: "Karen's 11 Aug email has no reply. The two docks with the most battery warnings are ECPA-D16 and ECPA-D29 (17 each); the dock-to-force map is not on file, so whether these are Karen's two is unconfirmed.", refs: ["A:emails/2026-08-11_karen_batteries.txt", "A:device_events.csv"] },
    { id: "a_karen_cold", title: "Karen Mbeki is going cold", date: null, severity: "medium", deal: "a_westmere", detail: "Heaviest user (62 sign-ins in 90 days) and the only force contact on file. Her last email before the handover got no reply.", refs: ["A:users.json", "A:emails/2026-08-11_karen_batteries.txt"] },
    { id: "a_open_ticket", title: "A force's document request sat unanswered with no owner", date: null, severity: "low", deal: "a_tarn", detail: "FB-10412 opened 2026-06-29, chased, no reply, no owner. The blocker is cleared in the game data; confirm the ticket is closed.", refs: ["A:requests.csv", "pj_ticket"] },
  ],
  B: [
    { id: "b_renewal_end", title: "Contract ends with no automatic renewal", date: D("2027-01-31"), severity: "high", deal: "b_renewal", detail: "New order needed by 31 Jan 2027 for 140,000 euros a year. Group finance wants a per-plant quote first.", refs: ["B:contract.txt", "B:emails/2026-10-08_finance_mailbox.txt"] },
    { id: "b_headline_claim", title: "The 1.2 million euro ROI headline has no working behind it", date: null, severity: "high", deal: "b_sister", detail: "The spreadsheet counts guard hours the drones could replace; no guard contract was reduced and finance booked no saving. The case study cannot lead with it.", refs: ["sr_roi_0", "sr_roi_2", "roi_spreadsheet"] },
    { id: "b_concentration", title: "Four of 14 docks produce 82% of flights", date: null, severity: "high", deal: "b_insurance", detail: "AD-02, AD-05, AD-08 and AD-10 flew 538 of 655 flights in 27 weeks; AD-14 flew none. Stefan reports 13 of 15 plants flying.", refs: ["B:usage_weekly.csv", "sr_roll_0"] },
    { id: "b_insurer_review", title: "Insurer's review in about five months", date: null, severity: "medium", deal: "b_insurance", detail: "Date not on file. Idle docks put the 6% premium cut (about 180,000 euros a year) at risk.", refs: ["jt_review_2", "jt_prem_2"] },
    { id: "b_ad01_offline", title: "AD-01 keeps dropping offline", date: null, severity: "medium", deal: "b_idle", detail: "Five offline/back-online cycles between 2026-09-08 and 2026-10-08. Plant 11's FB-10903 describes the same symptom, but the dock-to-plant list is not on file, so the match is unconfirmed.", refs: ["B:device_events.csv", "B:requests.csv"] },
    { id: "b_deputy", title: "The deputy who knows the rollout is leaving", date: null, severity: "high", deal: "b_idle", detail: "Leaving date is not on file. Nothing is written down and the install list was never delivered.", refs: ["sr_repl_2", "B:calls/2026-04-23_rollout_close.txt"] },
  ],
};

export const GAPS = {
  A: [
    { gap: "Which dock sits at which force", why: "Cost per flight, battery warnings and the seven idle docks cannot be tied to a force or a budget holder.", who: "Field team (install sheets) or Rhys Calder", refs: ["A:profile.json"] },
    { gap: "Drone operator overtime cost", why: "Without it there is no cost per flight and the Westmere deal (250,000) stays blocked.", who: "Ewan Brooks (can pull in a week)", refs: ["eb_drone_2"] },
    { gap: "Who succeeds Rhys Calder, and who signs the renewal", why: "Renewal needs a new order by 28 Feb 2027 and every call on file was with Rhys.", who: "Rhys Calder; the alliance office", refs: ["champion_leaves", "A:contract.txt"] },
    { gap: "Finance contacts at all four forces", why: "Each force's CFO signs its own call-off; none is on file.", who: "Hannah Doyle; Ewan Brooks for Metro Central", refs: ["rc_funding_2", "A:profile.json"] },
    { gap: "Schedule 2 invoice split", why: "Who pays how much is held by Accounts and was never copied to customer success.", who: "FlytBase Accounts", refs: ["A:contract.txt"] },
    { gap: "The stadium project (30 docks)", why: "Only Rhys has mentioned it; nothing in writing from Westmere. Karen was never asked.", who: "Insp. Karen Mbeki", refs: ["A:deal_history.json"] },
  ],
  B: [
    { gap: "Which dock sits at which plant", why: "Per-plant cost, the usage drop and AD-01's offline cycles cannot be tied to a plant or a manager.", who: "Stefan Roy's deputy (holds the install list)", refs: ["B:profile.json", "B:calls/2026-04-23_rollout_close.txt"] },
    { gap: "Name and leaving date of Stefan Roy's deputy", why: "He is the single point of knowledge for the rollout.", who: "Stefan Roy (away) or Beatriz Alonso", refs: ["sr_repl_2", "ba_deputy_0"] },
    { gap: "Why three nightly docks stopped flying", why: "They stayed online with no ticket and nobody at the customer said anything. Network project, guard contract or plant decision are all possible; none is confirmed.", who: "Beatriz Alonso, Owen Fitch, plant managers", refs: ["usage_drop", "b_idle"] },
    { gap: "Any real saving", why: "No guard contract has been reduced and finance has booked nothing. Only the insurer's premium cut is verified.", who: "Nadia Rahman; Julian Tate", refs: ["sr_roi_2", "jt_prem_2"] },
    { gap: "Date of the insurer's review", why: "Said to be in five months; the date is not on file.", who: "Julian Tate", refs: ["jt_review_2"] },
    { gap: "How the group splits the cost between plants", why: "The order form does not say; Group Finance wants a per-plant quote.", who: "Nadia Rahman", refs: ["B:contract.txt", "B:emails/2026-10-08_finance_mailbox.txt"] },
  ],
};

// Richer wording for signals this build already knows about. Unknown signals still get a
// generic risk and move from the engine's own rules.
export const PLAYBOOK = {
  champion_leaves: {
    move: {
      title: "Secure the renewal route before Rhys leaves: successor, timetable, force finance contacts",
      deal: "a_renewal", owner: "You, with Achal Negi (commercial owner)", daysAfter: 4, value: 350000, weight: 8,
      why: "Rhys leaves in January and every call on file was with him alone, while the term ends 28 Feb 2027 with no automatic renewal. Ask him for the named successor and a handover meeting, agree a written renewal timetable, and meet Hannah Doyle (procurement) and each force's finance contact: 'the alliance has the budget' is a claim, and the facts say each force's chief finance officer signs its own call-off.",
      refs: ["A:contract.txt", "rc_funding_0", "rc_funding_2", "hd_calloff_2"],
    },
  },
  urgent_request: {
    move: {
      title: "Reply to Karen Mbeki in writing: operator training dates and cover on 5 December",
      deal: "a_westmere", owner: "You, with Achal Negi (commercial) and the support desk", due: "2026-12-01", value: 250000, weight: 12,
      why: "Two answers in writing: (1) how many more officers can be trained before 5 December and when, (2) who she calls if a dock fails and how fast anyone answers. The contract has no named contact and no out-of-hours cover, and further training is quoted separately, so get Achal Negi's approval before promising either. Give FB-11206 an owner today.",
      refs: ["A:contract.txt", "km_staff_2"],
    },
  },
  usage_drop: {
    move: {
      title: "Find out why AD-02, AD-05 and AD-10 stopped flying",
      deal: "b_insurance", owner: "You, with Beatriz Alonso and Owen Fitch", daysAfter: 2, value: 90000, weight: 11,
      why: "All three flew 5 to 7 times a week and then nothing for two weeks while staying online, with no ticket and no word from the customer. Ask Beatriz first (warm), ask Owen Fitch whether the network project is involved, and get the dock-to-plant list so you know whose plants these are. Insurer logs and the 31 Jan renewal both depend on regular flying.",
      refs: ["b_idle", "jt_review_2", "B:contract.txt"],
    },
  },
};
