// Baseline = the last copy of the game data that was fetched through the MCP (get_my_accounts,
// get_signals, get_all_paperwork). The live server overlays fresh MCP data on top of it, so the page
// still renders when the MCP is rate-limited (one call a minute per token). No token lives here.

export const ACCOUNTS = [
  {
    id: "A", name: "Eastern Counties Police Alliance", currency: "GBP",
    official_story: "Rollout under way. 4 forces, 35 docks, 300-dock framework tender in preparation.",
    stakeholders: [
      { id: "rhys_calder", name: "Rhys Calder", role: "Alliance drone programme lead", relationship: "ally", available: true },
      { id: "karen_mbeki", name: "Insp. Karen Mbeki", role: "Drone unit inspector, Westmere", relationship: "neutral", available: true },
      { id: "ewan_brooks", name: "Ewan Brooks", role: "Finance business partner, Metro Central", relationship: "warm", available: true },
      { id: "fatima_osei", name: "Fatima Osei", role: "Data protection officer, Tarn Valley", relationship: "warm", available: true },
      { id: "hannah_doyle", name: "Hannah Doyle", role: "Alliance procurement lead", relationship: "warm", available: true },
    ],
    facts: [
      { id: "km_usage_0", text: "We're flying all the time.", said_by: "Insp. Karen Mbeki", status: "told" },
      { id: "km_staff_2", text: "Six officers who also do other duties. Overtime is the main cost. Scaling to 30 docks needs nine more trained operators and shift cover.", said_by: "Insp. Karen Mbeki", status: "told" },
      { id: "rc_appetite_0", text: "All four forces are keen.", said_by: "Rhys Calder", status: "claim" },
      { id: "rc_appetite_2", text: "Only Westmere and Metro Central fly operationally. Tarn Valley has never flown a live mission and Norwold only trains.", said_by: "Rhys Calder", status: "told" },
      { id: "rc_funding_0", text: "The alliance has the budget.", said_by: "Rhys Calder", status: "claim" },
      { id: "rc_funding_2", text: "There is no pooled budget. Each force funds from its own budget and each chief finance officer must approve a call-off.", said_by: "Rhys Calder", status: "told" },
      { id: "hd_calloff_2", text: "A force's call-off needs its own finance sign-off. The alliance cannot commit them.", said_by: "Rhys Calder", status: "told" },
      { id: "rc_tender_0", text: "A 300-dock framework tender, spec being finalised.", said_by: "Rhys Calder", status: "told" },
      { id: "rc_tender_2", text: "The tender specification locks soon (see Deadlines). It has no costed operating model, and nobody has agreed who would fly 300 docks.", said_by: "Rhys Calder", status: "told" },
      { id: "hd_weights_1", text: "Evaluation weights cost per flight and the operating model at 40%. The comparator is the current helicopter air support contract.", said_by: "Hannah Doyle", status: "verified", verified_by: "draft_tender_spec" },
      { id: "hd_window_2", text: "Suppliers may brief the specification team only in a formal window that opens shortly (see Deadlines). She would accept a written clarification request with specific questions.", said_by: "Hannah Doyle", status: "verified", verified_by: "clarification_template" },
      { id: "fo_dpia_0", text: "We are working through the assessment and it is not finished.", said_by: "Fatima Osei", status: "told" },
      { id: "fo_dpia_2", text: "It cannot be signed until we receive the data-flow documents we asked the FlytBase support desk for four months ago. Nobody replied.", said_by: "Fatima Osei", status: "told" },
      { id: "fo_needs_3", text: "With data flows, retention periods, video storage location and access controls I can finish in three weeks. Norwold is waiting to copy my assessment.", said_by: "Fatima Osei", status: "told" },
      { id: "pj_ticket", text: "The Tarn Valley ticket asking for data-flow documents was logged four months ago and never answered. It sits in the support queue unassigned.", said_by: "Pranjal Suyal", status: "told" },
      { id: "srv_dataflow", text: "Engineering can produce the data-flow pack (flows, retention, video storage location, access controls) in a week, with the CSM owning the ask: sending it, chasing it, answering the DPO.", said_by: "SRV", status: "verified", verified_by: "dataflow_pack" },
      { id: "eb_heli_1", text: "A helicopter hour costs the force about 1,500 pounds all-in.", said_by: "Ewan Brooks", status: "verified", verified_by: "helicopter_cost_overtime" },
      { id: "eb_sign_2", text: "His chief finance officer will sign a call-off only with a cost per flight set against helicopter hours.", said_by: "Ewan Brooks", status: "told" },
      { id: "eb_drone_2", text: "He has no comparable drone figure because overtime for drone operators is not tracked separately. He could pull it in a week.", said_by: "Ewan Brooks", status: "told" },
    ],
    opportunities: [
      { id: "a_renewal", title: "Renew the alliance contract (35 docks)", stage: "identified", worth_up_to: null, blocker: null, evidence: ["rc_appetite_0", "rc_appetite_2"], deadline: null },
      { id: "a_tarn", title: "Tarn Valley and Norwold go live", stage: "agreed", worth_up_to: 200000, blocker: { text: "The DPIA cannot be signed without the data-flow documents FlytBase never sent", status: "cleared" }, evidence: ["rc_appetite_2", "fo_dpia_2", "fo_needs_3", "pj_ticket", "srv_dataflow", "support_ticket_history"], deadline: null },
      { id: "a_westmere", title: "Scale Westmere's fleet", stage: "qualified", worth_up_to: 250000, blocker: { text: "No cost per flight against helicopter hours", status: "open" }, evidence: ["km_staff_2", "eb_heli_1", "eb_drone_2", "eb_sign_2", "helicopter_cost_overtime"], deadline: null },
      { id: "a_tender", title: "Position for the 300-dock framework tender", stage: "agreed", worth_up_to: 1500000, blocker: { text: "The specification has no costed operating model", status: "cleared" }, evidence: ["rc_tender_2", "hd_weights_1", "hd_window_2", "hd_calloff_2", "rc_funding_2", "eb_sign_2", "draft_tender_spec", "clarification_template", "km_staff_2"], deadline: { text: "The tender specification locks. Whatever is not in it by then is out.", met: true, passed: false } },
    ],
    offers: [
      { id: "a_priority_support", title: "Priority support for the drone units", value: 60000, pitch_to: "Insp. Karen Mbeki", status: "open" },
      { id: "a_training", title: "Operator training for new pilots", value: 45000, pitch_to: "Insp. Karen Mbeki", status: "declined" },
      { id: "a_extra_docks", title: "Extra docks for Metro Central", value: 180000, pitch_to: "Ewan Brooks", status: "declined" },
    ],
    deadlines: [{ text: "The tender specification locks. Whatever is not in it by then is out.", passed: false }],
  },
  {
    id: "B", name: "Aldermoor Industrial Group", currency: "EUR",
    official_story: "ROI proven. 15 plants, 14 docks installed, 13 flying. Case study for 40-plant sister company in preparation.",
    stakeholders: [
      { id: "stefan_roy", name: "Stefan Roy", role: "Group head of security", relationship: "warm", available: false },
      { id: "beatriz_alonso", name: "Beatriz Alonso", role: "Plant manager, Plant 7", relationship: "warm", available: true },
      { id: "julian_tate", name: "Julian Tate", role: "Insurance and risk manager", relationship: "warm", available: true },
      { id: "nadia_rahman", name: "Nadia Rahman", role: "Group finance controller", relationship: "neutral", available: true },
      { id: "owen_fitch", name: "Owen Fitch", role: "Group IT infrastructure lead", relationship: "neutral", available: true },
    ],
    facts: [
      { id: "jt_prem_2", text: "The insurer cut premiums by 6% across nine plants, about 180,000 euros a year, citing the drone patrols. It is the only hard financial benefit and nobody in security asked him.", said_by: "Neel Sharma", status: "verified", verified_by: "insurer_premium_letter" },
      { id: "sr_roi_0", text: "ROI is proven, about 1.2 million euros a year saved.", said_by: "Stefan Roy", status: "claim" },
      { id: "sr_roi_2", text: "The figure is his own spreadsheet of guard patrol hours the drones could replace. No guard contract has been reduced and finance has booked no saving.", said_by: "Stefan Roy", status: "verified", verified_by: "roi_spreadsheet" },
      { id: "sr_roll_0", text: "Thirteen of fifteen plants are flying.", said_by: "Stefan Roy", status: "claim" },
      { id: "sr_repl_2", text: "The rollout template lives mostly in his deputy's head. The deputy leaves soon (see Deadlines), and nothing is written down.", said_by: "Stefan Roy", status: "told" },
      { id: "sr_plants_2", text: "Plants pay a share of the security budget. Several managers resent paying for equipment they did not choose.", said_by: "Stefan Roy", status: "told" },
      { id: "jt_review_2", text: "The insurer's review is in five months. Consistent flight logs by plant would extend the discount, and plants with idle docks put it at risk.", said_by: "Julian Tate", status: "told" },
      { id: "ba_use_0", text: "It's useful at night.", said_by: "Beatriz Alonso", status: "told" },
      { id: "ba_use_2", text: "The dock flies nightly, but the plant's guard contractor does not act on drone alerts because their contract does not cover it. Alerts go to her phone.", said_by: "Beatriz Alonso", status: "told" },
      { id: "ba_deputy_0", text: "Stefan's deputy, not Stefan, set up the Plant 7 dock and most of the others. He is the one who knows how a rollout is actually done.", said_by: "Beatriz Alonso", status: "told" },
      { id: "ba_playbook_2", text: "She wrote an informal checklist: night patrol routes and alert response. Nobody asked for it and she would share it.", said_by: "Beatriz Alonso", status: "verified", verified_by: "plant7_checklist" },
      { id: "ba_other_1", text: "I hear Plant 11 never uses theirs. Their manager sees it as head office's toy and the network there is poor.", said_by: "Beatriz Alonso", status: "told" },
    ],
    opportunities: [
      { id: "b_renewal", title: "Renew the Aldermoor contract (14 docks)", stage: "identified", worth_up_to: null, blocker: null, evidence: ["sr_roll_0", "ba_use_2", "jt_prem_2"], deadline: null },
      { id: "b_idle", title: "Bring the idle plants into regular patrol", stage: "qualified", worth_up_to: 180000, blocker: { text: "The network project will cut the docks off, and nobody owns adoption", status: "open" }, evidence: ["ba_other_1", "ba_use_2", "sr_plants_2", "sr_repl_2", "plant7_checklist"], deadline: { text: "Stefan's deputy leaves, and the rollout know-how with him unless it is written down first.", met: false, passed: false } },
      { id: "b_insurance", title: "Protect and extend the insurance discount", stage: "qualified", worth_up_to: 90000, blocker: { text: "No consistent flight logs by plant for the insurer's review", status: "open" }, evidence: ["jt_prem_2", "jt_review_2"], deadline: null },
      { id: "b_sister", title: "Case study for the 40-plant sister company", stage: "identified", worth_up_to: null, blocker: null, evidence: ["sr_roi_2", "jt_prem_2", "insurer_premium_letter"], deadline: null },
    ],
    offers: [
      { id: "b_priority_support", title: "Night-time priority support for Plant 7", value: 50000, pitch_to: "Beatriz Alonso", status: "won" },
      { id: "b_reporting", title: "Flight-log reporting by plant for finance and the insurer", value: 70000, pitch_to: "Nadia Rahman", status: "open" },
      { id: "b_more_plants", title: "Docks for Plant 15 and two idle plants", value: 160000, pitch_to: "Stefan Roy", status: "open" },
    ],
    deadlines: [{ text: "Stefan's deputy leaves, and the rollout know-how with him unless it is written down first.", passed: false }],
  },
];

export const FILES = [
  { id: "roi_spreadsheet", title: "Roi spreadsheet", path: "files/roi_spreadsheet.csv", account: "B" },
  { id: "insurer_premium_letter", title: "Insurer premium letter", path: "files/insurer_premium_letter.csv", account: "B" },
  { id: "plant7_checklist", title: "Plant7 checklist", path: "files/plant7_checklist.csv", account: "B" },
  { id: "draft_tender_spec", title: "Draft tender spec", path: "files/draft_tender_spec.csv", account: "A" },
  { id: "clarification_template", title: "Clarification template", path: "files/clarification_template.csv", account: "A" },
  { id: "support_ticket_history", title: "Support ticket history", path: "files/support_ticket_history.csv", account: "A" },
  { id: "helicopter_cost_overtime", title: "Helicopter cost overtime", path: "files/helicopter_cost_overtime.csv", account: "A" },
  { id: "dataflow_pack", title: "Dataflow pack", path: "files/dataflow_pack.csv", account: "A" },
];

// Signals as returned by get_signals when this baseline was taken (oldest first).
export const SIGNALS = [
  {
    id: "champion_leaves", account: "A", dated: "2026-11-17", title: "Eastern Counties: Rhys Calder is moving on",
    summary: "Rhys Calder has emailed to say he leaves the drone programme in January. No successor is named. Every call on file before the handover was with him alone.",
    records: [{ kind: "email", path: "A/emails/2026-11-17_rhys_moving.txt", text: "From: Rhys Calder\nTo: (the CSM on the account)\nDate: 17 November 2026\nSubject: A change on my side\n\nA quick note so you hear it from me. I am moving to another role in the new year and will hand over the drone programme in January. My successor has not been named yet.\n\nAnything we have agreed stands. Until January, keep sending things to the programme office and I will make sure they land.\n\nRhys\n" }],
  },
  {
    id: "urgent_request", account: "A", dated: "2026-11-18", title: "Eastern Counties: Westmere needs an answer before a public event",
    summary: "Insp. Karen Mbeki has written directly, and logged a ticket, ahead of a large public event on 5 December. She wants two things settled in writing this week: dates for training more operators before the day, and who answers if a dock fails on the day. Nobody has replied.",
    records: [
      { kind: "email", path: "A/emails/2026-11-18_karen_event.txt", text: "From: Insp. Karen Mbeki\nTo: (the CSM on the account)\nDate: 18 November 2026\nSubject: Public event, 5 December\n\nWe are policing a large public event on Saturday 5 December and I want the docks to carry more of it than they do now.\n\nWhatever was said last week, I need two things settled in writing this week.\n1. Operators. How many more of my officers can be trained before the day, and when.\n2. Cover on the day. If a dock fails, who do I call and how fast does anyone answer.\n\nI am logging this as a ticket as well, so it has a number.\n\nKaren Mbeki\nWestmere drone unit\n" },
      { kind: "request", path: "A/requests.csv", text: "request_id,opened,from,summary,status,owner,last_update,how_it_arrived\nFB-11206,2026-11-18,Westmere drone unit,\"Operator training and support cover before a public event on 5 December. Marked urgent by the requester.\",Open,,2026-11-18,Support ticket\n" },
    ],
  },
  {
    id: "usage_drop", account: "B", dated: "2026-11-30", title: "Aldermoor: three docks that fly most nights have stopped",
    summary: "New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.",
    records: [{ kind: "usage", path: "B/usage_weekly.csv", text: "week_start,dock_id,flights,days_online\n2026-11-02,AD-01,1,7\n2026-11-09,AD-01,0,7\n2026-11-16,AD-01,0,7\n2026-11-23,AD-01,0,7\n2026-11-02,AD-02,6,7\n2026-11-09,AD-02,7,7\n2026-11-16,AD-02,0,7\n2026-11-23,AD-02,0,7\n2026-11-02,AD-03,0,7\n2026-11-09,AD-03,0,7\n2026-11-16,AD-03,1,7\n2026-11-23,AD-03,0,7\n2026-11-02,AD-04,0,7\n2026-11-09,AD-04,1,7\n2026-11-16,AD-04,0,7\n2026-11-23,AD-04,0,7\n2026-11-02,AD-05,6,7\n2026-11-09,AD-05,7,7\n2026-11-16,AD-05,0,7\n2026-11-23,AD-05,0,7\n2026-11-02,AD-06,0,7\n2026-11-09,AD-06,0,7\n2026-11-16,AD-06,0,7\n2026-11-23,AD-06,1,7\n2026-11-02,AD-07,0,7\n2026-11-09,AD-07,0,7\n2026-11-16,AD-07,1,7\n2026-11-23,AD-07,0,7\n2026-11-02,AD-08,6,7\n2026-11-09,AD-08,7,7\n2026-11-16,AD-08,5,7\n2026-11-23,AD-08,6,7\n2026-11-02,AD-09,1,7\n2026-11-09,AD-09,0,7\n2026-11-16,AD-09,0,7\n2026-11-23,AD-09,0,7\n2026-11-02,AD-10,5,7\n2026-11-09,AD-10,6,7\n2026-11-16,AD-10,0,7\n2026-11-23,AD-10,0,7\n2026-11-02,AD-11,0,7\n2026-11-09,AD-11,0,7\n2026-11-16,AD-11,1,7\n2026-11-23,AD-11,0,7\n2026-11-02,AD-12,0,7\n2026-11-09,AD-12,1,7\n2026-11-16,AD-12,0,7\n2026-11-23,AD-12,0,7\n2026-11-02,AD-13,1,7\n2026-11-09,AD-13,0,7\n2026-11-16,AD-13,0,7\n2026-11-23,AD-13,0,7\n2026-11-02,AD-14,0,7\n2026-11-09,AD-14,0,7\n2026-11-16,AD-14,0,7\n2026-11-23,AD-14,0,7\n" }],
  },
];

// Derived from the paperwork (usage_weekly.csv, flights.csv, device_events.csv) for 2026-04-27 to 2026-10-31.
// Per dock: "<flights in all 27 weeks>/<flights in the last 4 weeks to 2026-10-26>".
export const METRICS = {
  A: {
    docks: 35, flights: 842, weeks: 27, range: ["2026-04-27", "2026-10-26"],
    perDock: "D01:43/9 D02:27/8 D03:29/0 D04:21/0 D05:6/0 D06:18/0 D07:43/9 D08:42/8 D09:0/0 D10:43/9 D11:0/0 D12:36/7 D13:19/0 D14:29/0 D15:0/0 D16:53/12 D17:34/6 D18:0/0 D19:7/0 D20:38/9 D21:40/8 D22:9/2 D23:0/0 D24:5/0 D25:0/0 D26:45/7 D27:42/9 D28:41/5 D29:49/12 D30:25/0 D31:5/0 D32:25/8 D33:30/11 D34:38/9 D35:0/0",
    prefix: "ECPA-",
    battery: { "ECPA-D16": 17, "ECPA-D29": 17, "ECPA-D27": 3, "ECPA-D22": 3, "ECPA-D02": 3, "ECPA-D33": 1, "ECPA-D10": 1 },
    connectionLosses: 57, scheduledFlights: 274, sources: ["usage_weekly.csv", "flights.csv", "device_events.csv"],
  },
  B: {
    docks: 14, flights: 655, weeks: 27, range: ["2026-04-27", "2026-10-26"],
    perDock: "01:12/1 02:118/16 03:13/1 04:10/2 05:118/17 06:14/3 07:14/1 08:167/26 09:14/2 10:135/20 11:12/1 12:14/3 13:14/3 14:0/0",
    prefix: "AD-",
    nightlyDocks: ["AD-02", "AD-05", "AD-08", "AD-10"],
    offline: { "AD-01": "five offline/back-online cycles between 2026-09-08 and 2026-10-08" },
    connectionLosses: 229, scheduledFlights: 538, sources: ["usage_weekly.csv", "flights.csv", "device_events.csv"],
  },
};

// Raw paperwork extracts (verbatim from get_all_paperwork) that numbers and claims cite.
export const SOURCES = {
  "A:contract.txt": { title: "A / contract.txt", text: "35 docks with aircraft and the platform. 350,000 a year. Term: 1 March 2026 to 28 February 2027. No automatic renewal. A renewal needs a new order before the term ends. Standard support: business hours, tickets in order of arrival. No named support contact and no out-of-hours cover. Further training is quoted separately. Not covered: any commitment about a future tender or framework; docks beyond the 35." },
  "A:deal_history.json": { title: "A / deal_history.json", text: "Open at handover: renewal of the 35 docks, 350,000 due 2027-02-28 (basis: contract; Rhys Calder says it will go through). Framework tender up to 300 docks: Rhys Calder's account only; no specification, timetable or evaluation method on file. Stadium project, 30 docks: Rhys Calder's account only; nothing in writing from Westmere or the alliance." },
  "A:profile.json": { title: "A / profile.json", text: "Not on file: a named contact at Metro Central, Tarn Valley or Norwold; the alliance procurement lead (name not recorded at the 16 Dec 2025 call); any finance contact at the alliance or a force; which dock sits at which force (install sheets not copied). Every call since May 2026 has been with Rhys Calder alone." },
  "A:calls/2026-07-22_check_in.txt": { title: "A / calls/2026-07-22_check_in.txt", text: "Rhys: The alliance has the budget. It will not be a problem. ... Rhys: Teething. All four forces are keen, I promise you. (Sam had asked about docks online every day that have not flown a single mission.)" },
  "A:calls/2025-12-16_pilot_review.txt": { title: "A / calls/2025-12-16_pilot_review.txt", text: "Procurement lead: anything larger than this order would have to go through a formal process and asked to be kept informed. Action 'Keep the procurement lead informed. Owner: none recorded.'" },
  "A:emails/2026-08-11_karen_batteries.txt": { title: "A / emails/2026-08-11_karen_batteries.txt", text: "Karen Mbeki: Two of our docks have batteries that will not last a night shift any more. We are swapping aircraft between docks to cope... [No reply on file.]" },
  "A:emails/2026-10-28_renewal.txt": { title: "A / emails/2026-10-28_renewal.txt", text: "Sam (28 Oct): the term ends on 28 February and there is no automatic renewal... Who signs it on your side? Rhys (30 Oct): The alliance has the budget. Same as last time: send it to the programme office and I will walk it through." },
  "A:requests.csv": { title: "A / requests.csv", text: "FB-10412 (2026-06-29) document request from a force, chased, no reply, open, no owner. Email of 2026-08-11 from Karen Mbeki on batteries: no reply, open." },
  "A:users.json": { title: "A / users.json", text: "Rhys Calder (account administrator): 9 sign-ins in 90 days, last 2026-10-21. Insp. Karen Mbeki (unit administrator): 62 sign-ins in 90 days, last 2026-11-10." },
  "B:contract.txt": { title: "B / contract.txt", text: "14 docks with aircraft and the platform. 140,000 a year (euros). Term: 1 February 2026 to 31 January 2027. No automatic renewal. One invoice a year to group security; the order form does not say how the customer shares the cost inside the group. Customer keeps each dock connected to its own plant network. Not covered: a dock for the fifteenth plant; any statement about savings." },
  "B:deal_history.json": { title: "B / deal_history.json", text: "Open at handover: renewal of the 14 docks, 140,000 due 2027-01-31 (Stefan Roy says it is a formality). Sister company, 40 plants: Stefan Roy's account only; no contact at the sister company; depends on a case study not started. Savings figure first quoted July 2026: no working supplied." },
  "B:profile.json": { title: "B / profile.json", text: "Not on file: Stefan Roy's deputy (who led the rollout), referred to by role only; anyone in group finance (one unsigned email from a shared mailbox, Oct 2026); anyone in group IT; a named contact at any plant other than Plant 7; which dock sits at which plant (install list stayed with the customer)." },
  "B:calls/2026-04-23_rollout_close.txt": { title: "B / calls/2026-04-23_rollout_close.txt", text: "The deputy kept the install list (which dock is at which plant, who was trained). We asked for a copy. Not received. No patrol schedule at most plants. No list of who receives alerts at each plant. 'The customer-side knowledge of this rollout sits with one person.'" },
  "B:calls/2026-10-13_check_in.txt": { title: "B / calls/2026-10-13_check_in.txt", text: "Stefan: Use the headline. ROI is proven. Sam: marketing will not publish a number without the working. Stefan: You do not need finance. Stefan on Plant 11 dock dropping offline: That is an IT matter on our side. Stefan on the finance mailbox email: Ignore it. The renewal is a formality." },
  "B:emails/2026-10-08_finance_mailbox.txt": { title: "B / emails/2026-10-08_finance_mailbox.txt", text: "Group Finance (shared mailbox), 8 Oct 2026: before a renewal is raised, please send the quote in a form that shows the cost for each plant. [Unsigned. No reply on file.]" },
  "B:emails/2026-09-18_beatriz_alerts.txt": { title: "B / emails/2026-09-18_beatriz_alerts.txt", text: "Beatriz Alonso (ticket FB-10944): can the night alerts from our dock go to more than one person? Support closed it with a settings guide. 'Nobody asked why she wanted to change it.'" },
  "B:requests.csv": { title: "B / requests.csv", text: "FB-10903 (2026-09-10) Plant 11: dock goes offline for days at a time; network link drops; pending customer's IT team since 2026-09-30. Finance mailbox renewal-quote request (2026-10-08): not followed up. Stefan Roy case study (2026-09-22): not started." },
  "B:invoices.json": { title: "B / invoices.json", text: "INV-26-0204, 2026-02-01, first year 14 docks less trial credit: EUR 128,000, paid 2026-02-26. First-year total EUR 140,000." },
  "B:device_events.csv": { title: "B / device_events.csv", text: "AD-01 offline/back_online cycles: 2026-09-08 to 09-12, 09-14 to 09-19, 09-22 to 09-25, 09-29 to 10-01, 10-06 to 10-08. 229 connection_lost events across the account in 2026-05-01 to 2026-10-31." },
  "A:device_events.csv": { title: "A / device_events.csv", text: "battery_health_warning (Aircraft battery below expected capacity): ECPA-D16 x17, ECPA-D29 x17, ECPA-D27 x3, ECPA-D22 x3, ECPA-D02 x3, ECPA-D33 x1, ECPA-D10 x1. 57 connection_lost events." },
  "A:usage_weekly.csv": { title: "A / usage_weekly.csv", text: "35 docks, 27 weeks (2026-04-27 to 2026-10-26), 842 flights. Docks with zero flights in the period: D09, D11, D15, D18, D23, D25, D35." },
  "B:usage_weekly.csv": { title: "B / usage_weekly.csv", text: "14 docks, 27 weeks, 655 flights. AD-02 118, AD-05 118, AD-08 167, AD-10 135 flights (538 together, 82%). AD-14: 0. All other docks 10 to 14 flights in 27 weeks." },
};
