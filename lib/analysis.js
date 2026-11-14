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
        decides: [{ id: "rhys_calder", why: "The morning debrief names Rhys as the decider on this renewal; he is the only channel on file and he is leaving. The alliance office signed the original order ('send it to the programme office').", refs: ["a_renewal", "A:emails/2026-10-28_renewal.txt", "A:contract.txt"] }],
        pays: [{ id: "ewan_brooks", why: "The morning debrief names Ewan as the payer. The facts add that each force's finance officer approves its own call-off (rc_funding_2) and the contract is invoiced in four parts (Schedule 2, held by Accounts), so confirm who holds the renewal budget.", refs: ["a_renewal", "rc_funding_2", "A:contract.txt"] }],
        uses: [{ id: "karen_mbeki", why: "Heaviest day-to-day user (62 sign-ins in 90 days vs Rhys 9).", refs: ["A:users.json"] }],
        blocks: [{ id: "rhys_calder", why: "Sole channel; leaves January with no named successor.", refs: ["champion_leaves"] },
          { id: null, label: "Nobody can show which forces actually use the docks", why: "The morning debrief gives this as the blocker. The proof is the flight log by force and month (flight_log_force_month), which we do not hold; the dock-to-force map is not on file either.", refs: ["a_renewal", "flight_log_force_month", "A:usage_weekly.csv"] }],
      },
    },
  ],
  B: [
    {
      deal: "b_renewal", note: "140,000 euros a year, no automatic renewal, term ends 31 Jan 2027. Group finance wants a quote by plant; Stefan calls the renewal a formality.",
      roles: {
        decides: [{ id: "nadia_rahman", why: "The morning debrief names Nadia as the decider; the blocker is that finance cannot verify the savings the programme claims. Stefan Roy signed the order and calls renewal a formality, but is away and tells us to ignore finance.", refs: ["b_renewal", "sr_roi_2", "B:calls/2026-10-13_check_in.txt", "B:contract.txt"] },
          { id: "stefan_roy", why: "Signed the original order and champions the renewal, but is away.", refs: ["B:contract.txt", "B:calls/2026-10-13_check_in.txt"] }],
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
        blocks: [{ id: "owen_fitch", why: "Group IT: the network project will cut the docks off; FB-10903 has waited on IT since September. The morning debrief says a proposal to Owen needs network_plan, plant7_checklist and of_offer_3; we hold only plant7_checklist.", refs: ["b_idle", "B:requests.csv", "plant7_checklist", "network_plan", "of_offer_3"] }],
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
        decides: [{ id: "stefan_roy", why: "The morning debrief names Stefan as the decider. The sister company itself (40 plants) has no contact on file.", refs: ["b_sister", "B:deal_history.json"] }],
        pays: [{ id: "nadia_rahman", why: "The morning debrief names Nadia as the payer. No commercial discussion is on file.", refs: ["b_sister", "B:deal_history.json"] }],
        uses: [{ id: "beatriz_alonso", why: "Willing to share her Plant 7 checklist.", refs: ["ba_playbook_2", "plant7_checklist"] }],
        blocks: [{ id: "stefan_roy", why: "Wants the 1.2 million headline; marketing will not publish it without working.", refs: ["sr_roi_0", "sr_roi_2"] },
          { id: null, label: "Every number rests on an unverified spreadsheet", why: "The morning debrief gives this as the blocker. The spreadsheet is Stefan's own guard-hours estimate; only the insurer premium cut is verified.", refs: ["b_sister", "roi_spreadsheet", "sr_roi_2", "jt_prem_2"] }],
      },
    },
  ],
  K: [
    {
      deal: "k_golive_1fe", note: "Paid for and not flying: never commissioned, nobody at the estate can fly it and the insurer has not been told. Spend beyond the purchase goes to a residents' board vote.",
      roles: {
        decides: [{ id: "k_dana_1fe", why: "Named on the installer's order and wants night patrol of the two entrances; she runs the estate day to day but spend beyond the purchase needs the board.", refs: ["k_need_entrances_1fe", "k_board_pays_1fe", "K:profile.json"] }],
        pays: [{ id: "k_graham_1fe", why: "Chairs the residents' board, which votes on any spend beyond the original purchase. The first year was paid by the reseller.", refs: ["k_board_pays_1fe", "K:invoices.json"] }],
        uses: [{ id: null, label: "Estate staff (not named, no certified pilot)", why: "Nobody at the estate holds a pilot certificate; Dana assumed the system flies itself.", refs: ["k_no_pilot_1fe"] }],
        blocks: [{ id: "k_lucy_1fe", why: "The policy requires new aerial equipment to be notified before use and the dock is not declared (verified).", refs: ["k_insurer_not_told_1fe", "K_insurance_schedule_1fe"] }, { id: "k_graham_1fe", why: "Some residents already ask why they paid for a drone that has never flown.", refs: ["k_board_doubts_1fe"] }],
      },
    },
    {
      deal: "k_south_1fe", note: "Only Dana has raised it, and only as a wish if the north gate works. The south entrance was never assessed.",
      roles: {
        decides: [{ id: "k_graham_1fe", why: "Any spend beyond the original purchase needs the residents' board vote.", refs: ["k_board_pays_1fe"] }],
        pays: [{ id: "k_graham_1fe", why: "The board funds anything beyond the first order.", refs: ["k_board_pays_1fe"] }],
        uses: [{ id: "k_dana_1fe", why: "Would like a second dock for the south entrance, if it works at the north gate (a claim).", refs: ["k_south_wish_1fe"] }],
        blocks: [{ id: null, label: "South entrance coverage (never assessed)", why: "Raised at install and not assessed, so nobody knows if a dock there would work.", refs: ["k_south_unassessed_1fe", "K_install_note_1fe"] }],
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
      why: "His CFO signs only against a cost per flight set against helicopter hours. The helicopter side is verified at about 1,500 pounds an hour; the drone side is missing and Ewan can pull it in a week. The proposal to Ewan needs exactly three pieces: helicopter_cost_overtime (held), km_staff_2 (held) and flight_log_force_month (not held, ask for it). Unblocks Westmere (250,000) and re-opens the declined 180,000 docks offer.",
      refs: ["eb_sign_2", "eb_heli_1", "eb_drone_2", "helicopter_cost_overtime", "km_staff_2", "flight_log_force_month"],
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
      why: "The insurer reviews in about five months; consistent logs by plant extend the 6% cut, idle docks put it at risk. Only 4 of 14 docks fly regularly (AD-02, AD-05, AD-08, AD-10). The proposal to Julian needs exactly flight_log_by_plant and insurance_pack_template, and we hold neither.",
      refs: ["jt_review_2", "jt_prem_2", "B:usage_weekly.csv", "flight_log_by_plant", "insurance_pack_template"],
    },
    {
      id: "b_owen_network", title: "Take Owen Fitch a proposal that keeps the docks on the network", deal: "b_idle",
      owner: "You, with Owen Fitch (Group IT) and Beatriz Alonso", due: D("2026-12-09"), value: 180000, weight: 5,
      why: "The network project will cut the docks off and nobody owns adoption. The proposal needs exactly three pieces: network_plan (not held), plant7_checklist (held) and of_offer_3 (Owen's own offer, not held). Ask Owen for the plan and his offer first, then use Plant 7 as the proof.",
      refs: ["b_idle", "network_plan", "plant7_checklist", "of_offer_3", "B:requests.csv"],
    },
  ],
  K: [
    {
      id: "k_call_dana", title: "Call Dana Whitfield: a named person, an honest answer and a dated go-live plan", deal: "k_golive_1fe",
      owner: "You, with Dana Whitfield", due: D("2026-12-02"), value: 14000, weight: 8,
      why: "Her only email (19 Oct) got an automatic reply and nobody at FlytBase has ever spoken to her; the installer has stopped answering and the game lists a go-live plan promised to her within 2 days. Tell her what is true: the dock was never commissioned, nobody at the estate can fly it and the insurer has not been told. She assumed it flies itself.",
      refs: ["k_installer_gone_1fe", "k_not_commissioned_1fe", "k_no_pilot_1fe", "K:emails/2026-10-19_dana_when.txt", "K:requests.csv", "K_install_note_1fe"],
    },
    {
      id: "k_insurer_notice", title: "Get the dock declared to the property insurer before any flight", deal: "k_golive_1fe",
      owner: "You, with Dana Whitfield and Lucy Pratt (broker)", due: D("2026-12-03"), value: 14000, weight: 7,
      why: "The schedule says new aerial equipment must be notified to the insurer before use, and it lists no drone or dock (CCTV and a Friday and Saturday night guard are the declared measures). Ask Lucy Pratt what notice she needs and get it sent first; the policy period ends 2027-03-31.",
      refs: ["k_insurer_not_told_1fe", "K_insurance_schedule_1fe"],
    },
    {
      id: "k_pilot_course", title: "Offer the pilot certification course for two estate staff", deal: "k_golive_1fe",
      owner: "You, with Dana Whitfield", due: D("2026-12-04"), value: 14000, weight: 6,
      why: "Nobody at the estate holds a certificate and the reseller's order left training out. The open offer (4,000 pounds, pitched to Dana) is the route to two certified people; commission the dock with a first test flight once they hold the certificate and the insurer has been told.",
      refs: ["k_no_pilot_1fe", "k_training_1fe", "K:contract.txt", "k_not_commissioned_1fe"],
    },
    {
      id: "k_board_case", title: "Prepare the board case with Graham Okafor before the vote", deal: "k_golive_1fe",
      owner: "You, with Graham Okafor", due: D("2026-12-03"), value: 14000, weight: 6,
      why: "Spend beyond the purchase needs a residents' board vote and some residents ask why they paid for a drone that never flew. Bring a dated commissioning plan so the vote is about a working dock and night patrol of the two entrances, not mapping the estate.",
      refs: ["k_board_pays_1fe", "k_board_doubts_1fe", "k_need_entrances_1fe"],
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
  K: [
    { id: "k_golive_plan_due", title: "The go-live plan promised to Dana falls due", date: D("2026-12-02"), severity: "high", deal: "k_golive_1fe", detail: "The game lists a go-live plan promised to her, two days out. Nobody from FlytBase has spoken to her and her 19 October email got only an automatic reply.", refs: ["K:emails/2026-10-19_dana_when.txt", "K:requests.csv", "K:profile.json"] },
    { id: "k_board_vote", title: "Residents vote on renewing the security budget", date: D("2026-12-03"), severity: "high", deal: "k_golive_1fe", detail: "The game's clock puts the vote three days out. Graham Okafor says the board meets on the first Monday of each month, which would be 2026-12-07, so plan for the earlier date. Some residents already ask why they paid for a drone that has never flown.", refs: ["k_board_pays_1fe", "k_board_doubts_1fe"] },
    { id: "k_uninsured_flight", title: "Flying before the insurer is told breaks the policy's notice rule", date: null, severity: "high", deal: "k_golive_1fe", detail: "The schedule requires notice before any new aerial equipment is used and the dock is not declared. Dana thinks it will fly once switched on.", refs: ["k_insurer_not_told_1fe", "K_insurance_schedule_1fe", "k_no_pilot_1fe"] },
    { id: "k_never_flown", title: "Seven weeks online and not one flight", date: null, severity: "medium", deal: "k_golive_1fe", detail: "KE-D01 flew 0 times in the 7 weeks from 2026-09-14 while online every day. The reseller paid 14,000 pounds on 2026-09-14.", refs: ["K:usage_weekly.csv", "K:invoices.json"] },
    { id: "k_no_owner", title: "No FlytBase person has ever spoken to this customer", date: null, severity: "medium", deal: "k_golive_1fe", detail: "Sold through a reseller who has gone quiet; no onboarding call was held and there is no commercial owner on file.", refs: ["K:profile.json", "K:deal_history.json", "k_installer_gone_1fe"] },
    { id: "k_renewal_end", title: "Term ends with no automatic renewal", date: D("2027-09-13"), severity: "low", deal: "k_golive_1fe", detail: "14,000 pounds a year, term 2026-09-14 to 2027-09-13. A renewal needs a new order and the estate has had nothing flying for the money so far.", refs: ["K:contract.txt", "K:deal_history.json"] },
  ],
};

export const GAPS = {
  A: [
    { gap: "Which dock sits at which force", why: "Cost per flight, battery warnings and the seven idle docks cannot be tied to a force or a budget holder.", who: "Field team (install sheets) or Rhys Calder", refs: ["A:profile.json"] },
    { gap: "Drone operator overtime cost", why: "Without it there is no cost per flight and the Westmere deal (250,000) stays blocked.", who: "Ewan Brooks (can pull in a week)", refs: ["eb_drone_2"] },
    { gap: "Who succeeds Rhys Calder, and who signs the renewal", why: "Renewal needs a new order by 28 Feb 2027 and every call on file was with Rhys.", who: "Rhys Calder; the alliance office", refs: ["champion_leaves", "A:contract.txt"] },
    { gap: "Finance contacts at all four forces", why: "Each force's CFO signs its own call-off; none is on file.", who: "Hannah Doyle; Ewan Brooks for Metro Central", refs: ["rc_funding_2", "A:profile.json"] },
    { gap: "Schedule 2 invoice split", why: "Who pays how much is held by Accounts and was never copied to customer success.", who: "FlytBase Accounts", refs: ["A:contract.txt"] },
    { gap: "Flight log by force and month", why: "The proof that shows which forces actually use the docks, named in the morning debrief as part of the Westmere proposal and the renewal blocker. We do not hold the file.", who: "FlytBase data team or Rhys Calder", refs: ["flight_log_force_month", "a_renewal", "a_westmere"] },
    { gap: "The stadium project (30 docks)", why: "Only Rhys has mentioned it; nothing in writing from Westmere. Karen was never asked.", who: "Insp. Karen Mbeki", refs: ["A:deal_history.json"] },
  ],
  B: [
    { gap: "Which dock sits at which plant", why: "Per-plant cost, the usage drop and AD-01's offline cycles cannot be tied to a plant or a manager.", who: "Stefan Roy's deputy (holds the install list)", refs: ["B:profile.json", "B:calls/2026-04-23_rollout_close.txt"] },
    { gap: "Name and leaving date of Stefan Roy's deputy", why: "He is the single point of knowledge for the rollout.", who: "Stefan Roy (away) or Beatriz Alonso", refs: ["sr_repl_2", "ba_deputy_0"] },
    { gap: "Why three nightly docks stopped flying", why: "They stayed online with no ticket and nobody at the customer said anything. Network project, guard contract or plant decision are all possible; none is confirmed.", who: "Beatriz Alonso, Owen Fitch, plant managers", refs: ["usage_drop", "b_idle"] },
    { gap: "Any real saving", why: "No guard contract has been reduced and finance has booked nothing. Only the insurer's premium cut is verified.", who: "Nadia Rahman; Julian Tate", refs: ["sr_roi_2", "jt_prem_2"] },
    { gap: "Date of the insurer's review", why: "Said to be in five months; the date is not on file.", who: "Julian Tate", refs: ["jt_review_2"] },
    { gap: "Network plan and Owen Fitch's own offer", why: "A proposal to Group IT needs network_plan and of_offer_3; we hold neither, and the network project is what threatens the docks.", who: "Owen Fitch", refs: ["network_plan", "of_offer_3", "b_idle"] },
    { gap: "Flight log by plant and the insurance pack template", why: "Julian Tate's proposal needs flight_log_by_plant and insurance_pack_template; we hold neither, and the insurer's review depends on them.", who: "Julian Tate; FlytBase data team", refs: ["flight_log_by_plant", "insurance_pack_template", "b_insurance"] },
    { gap: "How the group splits the cost between plants", why: "The order form does not say; Group Finance wants a per-plant quote.", who: "Nadia Rahman", refs: ["B:contract.txt", "B:emails/2026-10-08_finance_mailbox.txt"] },
  ],
  K: [
    { gap: "How long certification takes and who runs it", why: "Two estate staff need a certificate before the first flight; the offer is open at 4,000 pounds.", who: "Pranjal Suyal (Lead Solutions Engineer) or a training partner", refs: ["k_no_pilot_1fe", "k_training_1fe"] },
    { gap: "What notice the insurer needs and how long it takes", why: "Only the schedule extract is held; Lucy Pratt knows the full conditions.", who: "Lucy Pratt", refs: ["K_insurance_schedule_1fe", "k_insurer_not_told_1fe"] },
    { gap: "Date of the board vote", why: "The game's clock says three days out; Graham Okafor says the first Monday of each month (2026-12-07).", who: "Graham Okafor", refs: ["k_board_pays_1fe"] },
    { gap: "Whether the north entrance coverage works", why: "No test flight was ever done, so nothing proves the dock covers the gate.", who: "A FlytBase solutions engineer, after commissioning", refs: ["k_not_commissioned_1fe", "K_install_note_1fe"] },
    { gap: "Whether the south entrance can be covered at all", why: "Raised at install and never assessed; the second dock rests on it.", who: "A FlytBase solutions engineer", refs: ["k_south_unassessed_1fe", "k_south_wish_1fe"] },
    { gap: "Who else at the estate counts", why: "Only Dana is on file as a contact; the board chair and the broker came from the account brief.", who: "Dana Whitfield", refs: ["K:profile.json"] },
    { gap: "Who owns this customer on the FlytBase side", why: "No commercial owner is on file and the reseller no longer answers.", who: "FlytBase sales leadership (Achal Negi, Director of Business Development)", refs: ["K:profile.json", "k_installer_gone_1fe"] },
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

// Files the morning debrief names as proof for a proposal that we do not hold. Real ids from the game.
export const MISSING_FILES = {
  flight_log_force_month: { label: "File: Flight log force month (not held)", text: "Named in the morning debrief as a piece of the Westmere proposal to Ewan Brooks (account A). We do not hold it. Open with get_file(\"flight_log_force_month\") if the game exposes it." },
  network_plan: { label: "File: Network plan (not held)", text: "Named in the morning debrief as a piece of the idle-plants proposal to Owen Fitch (account B). We do not hold it." },
  of_offer_3: { label: "Owen Fitch (fact, not held)", text: "Owen Fitch's own offer, named in the morning debrief as a piece of the idle-plants proposal (account B). We do not hold it." },
  flight_log_by_plant: { label: "File: Flight log by plant (not held)", text: "Named in the morning debrief as a piece of the insurance proposal to Julian Tate (account B). We do not hold it." },
  insurance_pack_template: { label: "File: Insurance pack template (not held)", text: "Named in the morning debrief as a piece of the insurance proposal to Julian Tate (account B). We do not hold it." },
};

// ---- Fallbacks for an account nobody has written a curated layer for. Everything below is read from the
// account's own data (facts, deals, offers, deadlines), so a new account still gets all five answers.
const dateFromMinute = (asOf, minute) => new Date(Date.parse(asOf + "T00:00:00Z") + (minute / 1440) * 86400000).toISOString().slice(0, 10);
export function genericPower(acct) {
  const byName = Object.fromEntries(acct.stakeholders.map((x) => [x.name, x]));
  return acct.opportunities.map((o) => {
    const facts = (o.evidence || []).map((id) => acct.facts.find((f) => f.id === id)).filter(Boolean);
    const people = [...new Set(facts.map((f) => f.said_by))].map((n) => byName[n]).filter(Boolean);
    const lead = people[0];
    const row = (x, why, refs) => ({ id: x ? x.id : null, label: x ? undefined : "Not on file", why, refs });
    return {
      deal: o.id, note: o.blocker ? `Open blocker: ${o.blocker.text}.` : "No blocker recorded.",
      roles: {
        decides: [row(lead, lead ? `Source of most of the evidence on this deal (${lead.role}). Role on the decision not stated in the data.` : "No decision maker is named in the data.", facts.map((f) => f.id).slice(0, 2))],
        pays: [row(null, "Who pays is not stated in the data.", [o.id])],
        uses: [row(people[1] || null, people[1] ? `${people[1].role}, also named in the evidence.` : "No user is named in the data.", facts.map((f) => f.id).slice(0, 2))],
        blocks: [row(null, o.blocker ? o.blocker.text : "Nothing recorded.", [o.id])],
      },
    };
  });
}
export function genericMoves(acct, asOf) {
  const out = [];
  for (const o of acct.opportunities) {
    if (o.blocker && o.blocker.status !== "cleared") {
      const dl = o.deadline ? dateFromMinute(asOf, o.deadline.minute) : dateFromMinute(asOf, 7 * 1440);
      out.push({ id: `${o.id}_clear`, title: `Clear the blocker on "${o.title}"`, deal: o.id, owner: "You", due: dl, value: o.worth_up_to || 0, weight: 5, why: `${o.blocker.text}.${o.deadline ? ` Deadline: ${o.deadline.text}.` : ""}`, refs: [o.id, ...(o.evidence || []).slice(0, 3)] });
    }
  }
  for (const d of acct.deadlines || []) if (!d.passed) out.push({ id: `${acct.id}_dl_${d.minute}`, title: d.text, deal: null, owner: "You", due: dateFromMinute(asOf, d.minute), value: 0, weight: 4, why: "Deadline from the account record.", refs: [acct.id] });
  return out;
}
export function genericRisks(acct, asOf) {
  const out = [];
  for (const d of acct.deadlines || []) if (!d.passed) out.push({ id: `${acct.id}_rk_${d.minute}`, title: d.text, date: dateFromMinute(asOf, d.minute), severity: "high", deal: null, detail: "Deadline from the account record.", refs: [acct.id] });
  for (const f of acct.facts) if (f.status === "claim") out.push({ id: `${f.id}_claim`, title: `Claim not checked: ${f.text}`, date: null, severity: "medium", deal: null, detail: `${f.said_by} said this; nothing verifies it.`, refs: [f.id] });
  return out;
}
export function genericGaps(acct) {
  return acct.facts.filter((f) => f.status === "told").map((f) => ({ gap: `Told, not verified: ${f.text}`, why: `Only ${f.said_by} has said it; no file or record backs it.`, who: f.said_by, refs: [f.id] }));
}
