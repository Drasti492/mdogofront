/* ==========================================================================
   KOPA RAHISI — Application logic
   Coursework mock: no real network calls, no real payments.
   All "payment" and "CRB" behaviour below is simulated client-side to
   illustrate an advance-fee loan-scam UX pattern for a fraud-awareness
   assignment. Nothing here contacts a backend or moves real money.
   ========================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     Reference data
     --------------------------------------------------------------------- */
  const COUNTIES = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir",
    "Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos",
    "Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
    "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia",
    "Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia",
    "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"
  ];

  // Diverse, non-repeating pool of Kenyan first names across communities.
  const KENYAN_NAMES = [
    "Wanjiku","Mwangi","Njoroge","Wambui","Kamau","Achieng","Otieno","Adhiambo",
    "Odhiambo","Auma","Kipyegon","Cherono","Kiptoo","Chebet","Rotich","Jepkosgei",
    "Wanjala","Nasimiyu","Wafula","Nekesa","Mutua","Mumo","Kavata","Nduku",
    "Onyango","Akinyi","Owino","Nyambura","Kariuki","Muthoni","Njeri","Gitau",
    "Cheruiyot","Jelagat","Kiplagat","Chepkoech","Barasa","Simiyu","Naliaka","Wekesa",
    "Mutiso","Kioko","Kilonzo","Musyoka","Omondi","Awuor","Okoth","Atieno",
    "Kiprotich","Chepngeno","Langat","Jerop","Wafubwa","Khisa","Situma","Nabwire",
    "Mueni","Ndunge","Kasyoka","Mbithe","Kamotho","Waweru","Ngugi","Wairimu",
    "Sang","Cherotich","Kigen","Chepkurui","Habiba","Fatuma","Abdi","Amina",
    "Halima","Mohamed","Nyaboke","Moraa","Bosire","Kemunto","Gisemba","Bikeri"
  ];

  const usedNames = new Set();

  function nextRandomName() {
    if (usedNames.size >= KENYAN_NAMES.length) usedNames.clear();
    let name;
    do {
      name = KENYAN_NAMES[Math.floor(Math.random() * KENYAN_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  function randomLoanAmount() {
    // KSh 5,000 – 40,000, rounded to nearest 100
    const amt = Math.floor((Math.random() * (40000 - 5000) + 5000) / 100) * 100;
    return amt;
  }

  /* ---------------------------------------------------------------------
     State
     --------------------------------------------------------------------- */
  const state = load();

  function load() {
    try {
      return JSON.parse(localStorage.getItem("kr_application")) || {};
    } catch {
      return {};
    }
  }
  function save() {
    localStorage.setItem("kr_application", JSON.stringify(state));
  }

  /* ---------------------------------------------------------------------
     Screen navigation
     --------------------------------------------------------------------- */
  const screens = document.querySelectorAll(".screen");
  function showScreen(name) {
    screens.forEach(s => s.classList.toggle("active", s.dataset.screen === name));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  }

  document.querySelectorAll('[data-action="apply"]').forEach(el =>
    el.addEventListener("click", () => { showScreen("app"); goToStep("register"); })
  );
  document.querySelectorAll('[data-action="landing"]').forEach(el =>
    el.addEventListener("click", () => showScreen("landing"))
  );
  document.querySelectorAll('[data-action="dashboard"]').forEach(el =>
    el.addEventListener("click", () => { populateDashboard(); showScreen("dashboard"); })
  );
  document.querySelectorAll('[data-nav="landing"]').forEach(el =>
    el.addEventListener("click", e => { e.preventDefault(); showScreen("landing"); })
  );

  /* ---------------------------------------------------------------------
     Hamburger menu
     --------------------------------------------------------------------- */
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.getElementById("mainNav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mainNav.classList.toggle("active");
    });
    document.addEventListener("click", e => {
      if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove("active");
        mainNav.classList.remove("active");
      }
    });
    mainNav.querySelectorAll("a, button").forEach(el =>
      el.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mainNav.classList.remove("active");
      })
    );
  }

  /* ---------------------------------------------------------------------
     Smooth scroll for in-page anchors
     --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        showScreen("landing");
        setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 30);
      }
    });
  });

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  document.querySelectorAll(".accordion-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const panel = item.querySelector(".accordion-panel");
      const isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("open");
        i.querySelector(".accordion-panel").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + 40 + "px";
      }
    });
  });

  /* ---------------------------------------------------------------------
     Populate counties
     --------------------------------------------------------------------- */
  const countySelect = document.getElementById("pCounty");
  if (countySelect) {
    countySelect.innerHTML = '<option value="" disabled selected>Select</option>' +
      COUNTIES.map(c => `<option>${c}</option>`).join("");
  }

  /* ---------------------------------------------------------------------
     Application steps
     --------------------------------------------------------------------- */
  const STEP_ORDER = ["register","personal","employment","income","education","guarantor","review","terms"];
  const STEP_LABELS = {
    register: "Account", personal: "Personal details", employment: "Employment",
    income: "Income", education: "Education", guarantor: "Guarantor",
    review: "Review", terms: "Terms"
  };
  let currentStepIndex = 0;

  const railList = document.getElementById("railList");
  if (railList) {
    railList.innerHTML = STEP_ORDER.map((key, i) => `
      <li class="rail-item" data-rail="${key}">
        <span class="rail-dot">${i + 1}</span>
        <span class="rail-label">${STEP_LABELS[key]}</span>
      </li>`).join("");
  }

  function goToStep(key) {
    currentStepIndex = STEP_ORDER.indexOf(key);
    document.querySelectorAll(".app-step").forEach(s => s.classList.toggle("active", s.dataset.step === key));
    updateRail();
    updateMobileProgress();
    if (key === "review") renderReview();
  }

  function updateRail() {
    document.querySelectorAll(".rail-item").forEach((item, i) => {
      item.classList.toggle("done", i < currentStepIndex);
      item.classList.toggle("current", i === currentStepIndex);
    });
  }

  function updateMobileProgress() {
    const fill = document.getElementById("progressFill");
    const label = document.getElementById("progressLabel");
    const pct = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = `Step ${currentStepIndex + 1} of ${STEP_ORDER.length} — ${STEP_LABELS[STEP_ORDER[currentStepIndex]]}`;
  }

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStepIndex > 0) goToStep(STEP_ORDER[currentStepIndex - 1]);
      else showScreen("landing");
    });
  });

  document.querySelectorAll('[data-next="terms"]').forEach(btn =>
    btn.addEventListener("click", () => goToStep("terms"))
  );

  /* ---------------------------------------------------------------------
     Validation helpers
     --------------------------------------------------------------------- */
  function setError(id, msg) {
    const el = document.getElementById("err-" + id);
    const input = document.getElementById(id);
    if (el) el.textContent = msg || "";
    if (input) input.classList.toggle("invalid", !!msg);
    return !msg;
  }

  function isValidKenyanPhone(v) {
    const cleaned = v.replace(/\s+/g, "");
    return /^(?:\+254|0)(7|1)\d{8}$/.test(cleaned);
  }

  /* ---------------------------------------------------------------------
     STEP: Register
     --------------------------------------------------------------------- */
  const registerForm = document.querySelector('[data-step="register"]');
  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      const phone = document.getElementById("regPhone").value.trim();
      const pin = document.getElementById("regPin").value.trim();
      const pinConfirm = document.getElementById("regPinConfirm").value.trim();

      let ok = true;
      ok = setError("regPhone", isValidKenyanPhone(phone) ? "" : "Enter a valid Kenyan mobile number.") && ok;
      ok = setError("regPin", /^\d{4}$/.test(pin) ? "" : "PIN must be exactly 4 digits.") && ok;
      ok = setError("regPinConfirm", pin === pinConfirm && pinConfirm.length === 4 ? "" : "PINs do not match.") && ok;
      if (!ok) return;

      state.phone = phone;
      save();
      goToStep("personal");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Personal
     --------------------------------------------------------------------- */
  const personalForm = document.querySelector('[data-step="personal"]');
  if (personalForm) {
    personalForm.addEventListener("submit", e => {
      e.preventDefault();
      const fullName = document.getElementById("pFullName").value.trim();
      const idNumber = document.getElementById("pIdNumber").value.trim();
      const dob = document.getElementById("pDob").value;
      const gender = document.getElementById("pGender").value;
      const county = document.getElementById("pCounty").value;
      const constituency = document.getElementById("pConstituency").value.trim();

      let ok = true;
      ok = setError("pFullName", fullName.length >= 3 ? "" : "Enter your full name.") && ok;
      ok = setError("pIdNumber", /^\d{6,10}$/.test(idNumber) ? "" : "Enter a valid ID number.") && ok;
      ok = setError("pDob", dob ? "" : "Select your date of birth.") && ok;
      ok = setError("pConstituency", constituency.length >= 2 ? "" : "Enter your constituency.") && ok;
      if (!gender) { alert("Please select your gender."); ok = false; }
      if (!county) { alert("Please select your county."); ok = false; }
      if (!ok) return;

      Object.assign(state, { fullName, idNumber, dob, gender, county, constituency });
      save();
      goToStep("employment");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Employment
     --------------------------------------------------------------------- */
  const employmentForm = document.querySelector('[data-step="employment"]');
  const eType = document.getElementById("eType");
  const employerField = document.getElementById("employerField");
  function toggleEmployerField() {
    const noEmployer = ["Student", "Unemployed"];
    employerField.style.display = noEmployer.includes(eType.value) ? "none" : "flex";
  }
  if (eType) { eType.addEventListener("change", toggleEmployerField); toggleEmployerField(); }

  if (employmentForm) {
    employmentForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!eType.value) { alert("Please select your employment type."); return; }
      state.employmentType = eType.value;
      state.employer = document.getElementById("eEmployer").value.trim();
      save();
      goToStep("income");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Income
     --------------------------------------------------------------------- */
  const incomeForm = document.querySelector('[data-step="income"]');
  if (incomeForm) {
    incomeForm.addEventListener("submit", e => {
      e.preventDefault();
      const selected = incomeForm.querySelector('input[name="income"]:checked');
      if (!selected) { setError("income", "Select your monthly income range."); return; }
      setError("income", "");
      state.income = selected.value;
      save();
      goToStep("education");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Education
     --------------------------------------------------------------------- */
  const educationForm = document.querySelector('[data-step="education"]');
  if (educationForm) {
    educationForm.addEventListener("submit", e => {
      e.preventDefault();
      const selected = educationForm.querySelector('input[name="education"]:checked');
      if (!selected) { setError("education", "Select your highest level of education."); return; }
      setError("education", "");
      state.education = selected.value;
      save();
      goToStep("guarantor");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Guarantor
     --------------------------------------------------------------------- */
  const guarantorForm = document.querySelector('[data-step="guarantor"]');
  if (guarantorForm) {
    guarantorForm.addEventListener("submit", e => {
      e.preventDefault();
      const gName = document.getElementById("gName").value.trim();
      const gPhone = document.getElementById("gPhone").value.trim();
      const gRelationship = document.getElementById("gRelationship").value;

      let ok = true;
      ok = setError("gName", gName.length >= 3 ? "" : "Enter guarantor's full name.") && ok;
      ok = setError("gPhone", isValidKenyanPhone(gPhone) ? "" : "Enter a valid Kenyan mobile number.") && ok;
      if (!gRelationship) { alert("Please select the relationship."); ok = false; }
      if (!ok) return;

      Object.assign(state, { gName, gPhone, gRelationship });
      save();
      goToStep("review");
    });
  }

  /* ---------------------------------------------------------------------
     STEP: Review
     --------------------------------------------------------------------- */
  function renderReview() {
    const list = document.getElementById("reviewList");
    if (!list) return;
    list.innerHTML = `
      <div class="review-group">
        <h4>Account</h4>
        <div class="review-row"><span>Mobile number</span><strong>${state.phone || "—"}</strong></div>
      </div>
      <div class="review-group">
        <h4>Personal details</h4>
        <div class="review-row"><span>Full name</span><strong>${state.fullName || "—"}</strong></div>
        <div class="review-row"><span>National ID</span><strong>${state.idNumber || "—"}</strong></div>
        <div class="review-row"><span>Date of birth</span><strong>${state.dob || "—"}</strong></div>
        <div class="review-row"><span>Gender</span><strong>${state.gender || "—"}</strong></div>
        <div class="review-row"><span>County</span><strong>${state.county || "—"}</strong></div>
        <div class="review-row"><span>Constituency</span><strong>${state.constituency || "—"}</strong></div>
      </div>
      <div class="review-group">
        <h4>Employment &amp; income</h4>
        <div class="review-row"><span>Employment type</span><strong>${state.employmentType || "—"}</strong></div>
        <div class="review-row"><span>Employer / business</span><strong>${state.employer || "—"}</strong></div>
        <div class="review-row"><span>Monthly income</span><strong>KSh ${state.income || "—"}</strong></div>
        <div class="review-row"><span>Education</span><strong>${state.education || "—"}</strong></div>
      </div>
      <div class="review-group">
        <h4>Guarantor</h4>
        <div class="review-row"><span>Full name</span><strong>${state.gName || "—"}</strong></div>
        <div class="review-row"><span>Phone number</span><strong>${state.gPhone || "—"}</strong></div>
        <div class="review-row"><span>Relationship</span><strong>${state.gRelationship || "—"}</strong></div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------------
     STEP: Terms + Submit
     --------------------------------------------------------------------- */
  const submitBtn = document.getElementById("submitApplicationBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const agree = document.getElementById("termsAgree").checked;
      if (!agree) { setError("terms", "You must agree to the Terms & Conditions to continue."); return; }
      setError("terms", "");

      // Generate application reference. Exact approved amount, collateral
      // fee and repayment terms are set once the applicant picks a limit
      // tier (see selectTier), after the CRB-flag step.
      state.reference = "KR-" + Date.now().toString().slice(-8);
      state.applicationDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      save();

      showScreen("processing");
      runProcessingSequence();
    });
  }

  /* ---------------------------------------------------------------------
     Tiered limits, collateral fees and repayment terms
     Sandbox demo only — figures are illustrative, no real payment moves.
     Rule (confirmed against lecturer's notes):
       total repayable   = approved amount + 20%
       weekly repayment  = total repayable ÷ 8   (always 8 weeks, since
                            120% ÷ 15%-of-principal-per-week resolves to
                            a fixed 8-week term regardless of amount)
     --------------------------------------------------------------------- */
  const TIERS = [
    { min: 2000,  max: 5000,  collateral: 180 },
    { min: 5000,  max: 8000,  collateral: 260 },
    { min: 8000,  max: 11000, collateral: 310 },
    { min: 11000, max: 14000, collateral: 450 },
    { min: 14000, max: 17000, collateral: 550 },
    { min: 17000, max: 20000, collateral: 670 }
  ];
  const REPAYMENT_WEEKS = 8;

  function roundTo10(n) { return Math.round(n / 10) * 10; }

  function renderTierTable() {
    const body = document.getElementById("tierTableBody");
    if (!body) return;
    body.innerHTML = TIERS.map((t, i) => {
      const illustrativeWeekly = roundTo10((t.min * 1.2) / REPAYMENT_WEEKS);
      return `<tr>
        <td>KSh ${t.min.toLocaleString()} – ${t.max.toLocaleString()}</td>
        <td>KSh ${t.collateral.toLocaleString()}</td>
        <td>KSh ${illustrativeWeekly.toLocaleString()}/wk</td>
        <td><button type="button" class="btn btn-primary btn-sm" data-tier="${i}">Get</button></td>
      </tr>`;
    }).join("");
    body.querySelectorAll("[data-tier]").forEach(btn =>
      btn.addEventListener("click", () => selectTier(parseInt(btn.dataset.tier, 10)))
    );
  }

  function selectTier(index) {
    const tier = TIERS[index];
    const approved = roundTo10(tier.min + Math.random() * (tier.max - tier.min)) ; // nearest 10
    const approvedAmount = Math.round(approved / 100) * 100; // nearest 100, stays within range
    const totalRepayable = roundTo10(approvedAmount * 1.2);
    const weeklyRepayment = roundTo10(totalRepayable / REPAYMENT_WEEKS);

    state.tierIndex = index;
    state.offerAmount = approvedAmount;
    state.collateralFee = tier.collateral;
    state.totalRepayable = totalRepayable;
    state.weeklyRepayment = weeklyRepayment;
    state.repaymentWeeks = REPAYMENT_WEEKS;
    save();

    document.getElementById("tcAmount").textContent = `KSh ${approvedAmount.toLocaleString()}`;
    document.getElementById("tcCollateral").textContent = `KSh ${tier.collateral.toLocaleString()}`;
    document.getElementById("tcWeekly").textContent = `KSh ${weeklyRepayment.toLocaleString()} / week`;
    document.getElementById("tcWeeks").textContent = `${REPAYMENT_WEEKS} weeks`;
    document.getElementById("tcTotal").textContent = `KSh ${totalRepayable.toLocaleString()}`;

    showScreen("tierconfirm");
  }

  renderTierTable();

  /* ---------------------------------------------------------------------
     Processing sequence -> ends in CRB "block" (coursework illustration)
     --------------------------------------------------------------------- */
  function runProcessingSequence() {
    const keys = ["verify", "credit", "rate", "crb"];
    const items = keys.map(k => document.querySelector(`#checkSteps li[data-key="${k}"]`));
    items.forEach(li => li.classList.remove("active", "done", "failed"));

    let i = 0;
    function step() {
      if (i > 0) items[i - 1].classList.replace("active", i - 1 === keys.length - 1 ? "failed" : "done");
      if (i >= keys.length) {
        setTimeout(() => showScreen("crbblock"), 500);
        return;
      }
      items[i].classList.add("active");
      i++;
      setTimeout(step, 1000);
    }
    step();
  }

  /* ---------------------------------------------------------------------
     Unblacklist modal + simulated STK push
     (No network call — purely a frontend animation for coursework use.)
     --------------------------------------------------------------------- */
  const unblacklistBtn = document.getElementById("unblacklistBtn");
  const unblacklistModal = document.getElementById("unblacklistModal");
  const modalClose = document.getElementById("modalClose");
  const sendPromptBtn = document.getElementById("sendPromptBtn");
  const stkModal = document.getElementById("stkModal");
  const getLoanNowBtn = document.getElementById("getLoanNowBtn");

  if (unblacklistBtn) {
    unblacklistBtn.addEventListener("click", () => {
      showScreen("tiertable");
    });
  }

  if (getLoanNowBtn) {
    getLoanNowBtn.addEventListener("click", () => {
      document.getElementById("unblockPhone").value = state.phone || "";
      const fee = state.collateralFee || 0;
      document.getElementById("modalTitle").textContent = "Pay collateral fee";
      document.getElementById("modalFeeAmount").textContent = `KSh ${fee.toLocaleString()}`;
      sendPromptBtn.textContent = `Pay collateral fee — KSh ${fee.toLocaleString()}`;
      unblacklistModal.classList.add("active");
    });
  }
  if (modalClose) {
    modalClose.addEventListener("click", () => unblacklistModal.classList.remove("active"));
  }
  unblacklistModal?.addEventListener("click", e => {
    if (e.target === unblacklistModal) unblacklistModal.classList.remove("active");
  });

  if (sendPromptBtn) {
    sendPromptBtn.addEventListener("click", () => {
      const phone = document.getElementById("unblockPhone").value.trim();
      if (!isValidKenyanPhone(phone)) {
        setError("unblockPhone", "Enter a valid Kenyan mobile number.");
        return;
      }
      setError("unblockPhone", "");
      unblacklistModal.classList.remove("active");
      simulatePayment();
    });
  }

  function simulatePayment() {
    const title = document.getElementById("stkStatusTitle");
    const sub = document.getElementById("stkStatusSub");
    title.textContent = "Sending payment prompt…";
    sub.textContent = "A simulated prompt has been sent to your phone. Enter your M-PESA PIN to confirm.";
    stkModal.classList.add("active");

    setTimeout(() => {
      title.textContent = "Confirming payment…";
      sub.textContent = "Simulated confirmation in progress. No real transaction is taking place.";
    }, 1800);

    setTimeout(() => {
      stkModal.classList.remove("active");
      showScreen("pending");
    }, 3400);
  }

  /* ---------------------------------------------------------------------
     Dashboard
     --------------------------------------------------------------------- */
  function populateDashboard() {
    document.getElementById("dashName").textContent = state.fullName || "—";
    document.getElementById("dashPhone").textContent = state.phone || "—";
    document.getElementById("dashRef").textContent = state.reference || "—";
    document.getElementById("dashAmount").textContent = state.offerAmount ? `KSh ${state.offerAmount.toLocaleString()}` : "—";
    document.getElementById("dashWeekly").textContent = state.weeklyRepayment ? `KSh ${state.weeklyRepayment.toLocaleString()} / week` : "—";
    document.getElementById("dashWeeks").textContent = state.repaymentWeeks ? `${state.repaymentWeeks} weeks` : "—";
    document.getElementById("dashTotal").textContent = state.totalRepayable ? `KSh ${state.totalRepayable.toLocaleString()}` : "—";
    document.getElementById("dashDate").textContent = state.applicationDate || "—";
    const statusEl = document.getElementById("dashStatus");
    statusEl.textContent = "Pending Final Verification";
    statusEl.classList.remove("received");
  }

  /* ---------------------------------------------------------------------
     Educational banner dismiss
     --------------------------------------------------------------------- */
  const eduBanner = document.getElementById("eduBanner");
  const eduClose = document.getElementById("eduClose");
  if (eduClose) eduClose.addEventListener("click", () => eduBanner.classList.add("hidden"));

  /* ---------------------------------------------------------------------
     Ticker popup — fake "recent approvals" social proof
     Illustrates a manipulation pattern used on real scam lending sites:
     fabricated activity notifications to build false trust/urgency.
     Runs continuously in the background; every ~2s, non-repeating names.
     --------------------------------------------------------------------- */
  const tickerPopup = document.getElementById("tickerPopup");
  const tickerAvatar = document.getElementById("tickerAvatar");
  const tickerText = document.getElementById("tickerText");
  let tickerTimer = null;
  let tickerVisible = false;

  function showTicker() {
    if (tickerVisible) return;
    const name = nextRandomName();
    const amount = randomLoanAmount();
    tickerAvatar.textContent = name.charAt(0);
    tickerText.innerHTML = `<strong>${name}</strong> just received a loan of KSh ${amount.toLocaleString()}`;
    tickerPopup.classList.add("show");
    tickerVisible = true;
    setTimeout(() => {
      tickerPopup.classList.remove("show");
      tickerVisible = false;
    }, 3200);
  }

  function startTicker() {
    if (tickerTimer) return;
    showTicker();
    tickerTimer = setInterval(showTicker, 5200); // ~2s visible + ~3.2s gap, non-overlapping
  }

  // Start once the page has settled.
  setTimeout(startTicker, 2500);

  /* ---------------------------------------------------------------------
     Dashboard demo withdrawal ticker
     "Claim your limit" style marketing notification, as used on real
     lending sites to show recent activity. Ours is explicitly labeled
     DEMO in the UI itself and never claims to reflect a real user,
     phone number, or withdrawal — it exists purely to illustrate the
     pattern for coursework, on the dashboard screen only.
     --------------------------------------------------------------------- */
  const DASH_NAMES = [
    "James","Evans","Brian","Kevin","Dennis","Peter","Samuel","Joseph","Michael","Daniel",
    "Faith","Mercy","Grace","Ann","Lucy","Esther","Purity","Irene","Diana","Sharon",
    "Mwangi","Otieno","Wanjiku","Nyambura","Kipyegon","Chebet","Wafula","Nekesa","Achieng","Odhiambo",
    "Kamau","Njoroge","Wambui","Muthoni","Kariuki","Cherono","Kiptoo","Rotich","Jepkosgei","Barasa",
    "Simiyu","Naliaka","Mutua","Nduku","Kilonzo","Omondi","Awuor","Moraa","Bosire","Abdi"
  ];
  let dashUsedNames = new Set();

  function nextDashName() {
    if (dashUsedNames.size >= DASH_NAMES.length) dashUsedNames.clear();
    let name;
    do {
      name = DASH_NAMES[Math.floor(Math.random() * DASH_NAMES.length)];
    } while (dashUsedNames.has(name));
    dashUsedNames.add(name);
    return name;
  }

  function maskedDemoPhone() {
    // Not a real number — random digits, masked, for display only.
    const prefix = Math.random() > 0.5 ? "07" : "01";
    const d = () => Math.floor(Math.random() * 10);
    const first2 = `${d()}${d()}`;
    const last2 = `${d()}${d()}`;
    return `${prefix}${first2}***${last2}`;
  }

  function randomDashAmount() {
    // Same limit range offered on this site: KSh 5,000 – 40,000.
    return Math.floor((Math.random() * (40000 - 5000) + 5000) / 100) * 100;
  }

  const dashTicker = document.getElementById("dashWithdrawTicker");
  const dwtAvatar = document.getElementById("dwtAvatar");
  const dwtText = document.getElementById("dwtText");
  let dashTickerInterval = null;

  function showDashTicker() {
    if (!dashTicker) return;
    const name = nextDashName();
    const phone = maskedDemoPhone();
    const amount = randomDashAmount();
    dwtAvatar.textContent = name.charAt(0);
    dwtText.innerHTML = `<strong>${name}</strong> <span class="dwt-phone">${phone}</span><br>withdrew a loan of KSh ${amount.toLocaleString()} <span class="dwt-phone">(demo)</span>`;
    dashTicker.classList.add("show");
    setTimeout(() => dashTicker.classList.remove("show"), 850);
  }

  function startDashTicker() {
    if (dashTickerInterval) return;
    showDashTicker();
    dashTickerInterval = setInterval(showDashTicker, 1000);
  }

  function stopDashTicker() {
    clearInterval(dashTickerInterval);
    dashTickerInterval = null;
    dashTicker?.classList.remove("show");
  }

  // Hook into screen navigation: only run while the dashboard is visible.
  const _originalShowScreen = showScreen;
  showScreen = function (name) {
    _originalShowScreen(name);
    if (name === "dashboard") startDashTicker();
    else stopDashTicker();
  };

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  showScreen("landing");
})();
