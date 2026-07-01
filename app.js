/* =========================================================
   HARAKA LOANS — Application logic
   Handles: navigation between screens, form validation,
   phone/PIN checks, localStorage state, eligibility
   calculation, reference number generation, dashboard.
   No network calls — everything runs client-side.
   ========================================================= */

const KENYA_COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir",
  "Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos",
  "Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
  "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia",
  "Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia",
  "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"
];

const STATE_KEY = "haraka_loan_state";

const state = {
  screenHistory: [],
  data: {
    phone: "",
    fullname: "",
    idnumber: "",
    dob: "",
    gender: "",
    county: "",
    constituency: "",
    employmentType: "",
    employer: "",
    income: "",
    education: "",
    guarantorName: "",
    guarantorPhone: "",
    guarantorRelationship: "",
    reference: "",
    approved: null,
    offerAmount: 0,
    maxAmount: 0,
    termDays: 0,
    monthlyRepayment: 0,
    appliedAt: ""
  }
};

function saveState(){
  try{ localStorage.setItem(STATE_KEY, JSON.stringify(state.data)); }catch(e){}
}
function loadState(){
  try{
    const raw = localStorage.getItem(STATE_KEY);
    if(raw) Object.assign(state.data, JSON.parse(raw));
  }catch(e){}
}

/* ============ SCREEN NAVIGATION ============ */
const FLOW_ORDER = ["landing","register","personal","employment","income","education","guarantor","review","processing","offer","dashboard"];

function showScreen(name, opts={}){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.querySelector(`[data-screen="${name}"]`);
  if(!target) return;
  target.classList.add("active");
  if(!opts.skipHistory) state.screenHistory.push(name);
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});

  const isFlowStep = ["register","personal","employment","income","education","guarantor","review"].includes(name);
  document.getElementById("topbar").style.display = (name === "processing" || name === "offer" || name === "decline" || name === "dashboard") ? "none" : "";
  document.getElementById("site-footer").style.display = (isFlowStep || name === "processing" || name === "offer" || name === "decline" || name === "dashboard") ? "none" : "";
}

function goBack(){
  state.screenHistory.pop(); // remove current
  const prev = state.screenHistory.pop() || "landing";
  showScreen(prev);
}

/* ============ VALIDATION HELPERS ============ */
function isValidKenyanPhone(v){
  const cleaned = v.replace(/\s+/g, "");
  return /^(0(7|1)\d{8})$|^(\+254(7|1)\d{8})$|^(254(7|1)\d{8})$/.test(cleaned);
}
function normalizePhone(v){
  let c = v.replace(/\s+/g, "");
  if(c.startsWith("+254")) c = "0" + c.slice(4);
  else if(c.startsWith("254")) c = "0" + c.slice(3);
  return c;
}
function setError(fieldId, msg){
  const errEl = document.getElementById("err-" + fieldId);
  const inputEl = document.getElementById(fieldId);
  if(errEl) errEl.textContent = msg || "";
  if(inputEl){
    const field = inputEl.closest(".field");
    if(field) field.classList.toggle("has-error", !!msg);
  }
}
function clearErrors(...ids){ ids.forEach(id => setError(id, "")); }

/* ============ REGISTER ============ */
document.getElementById("form-register").addEventListener("submit", e => {
  e.preventDefault();
  const phone = document.getElementById("reg-phone").value.trim();
  const pin = document.getElementById("reg-pin").value.trim();
  const pinConfirm = document.getElementById("reg-pin-confirm").value.trim();
  clearErrors("reg-phone","reg-pin","reg-pin-confirm");

  let valid = true;
  if(!isValidKenyanPhone(phone)){
    setError("reg-phone", "Enter a valid Kenyan mobile number, e.g. 0712 345 678");
    valid = false;
  }
  if(!/^\d{4}$/.test(pin)){
    setError("reg-pin", "PIN must be exactly 4 digits");
    valid = false;
  }
  if(pin !== pinConfirm){
    setError("reg-pin-confirm", "PINs do not match");
    valid = false;
  }
  if(!valid) return;

  state.data.phone = normalizePhone(phone);
  saveState();
  showScreen("personal");
});

/* ============ PERSONAL DETAILS ============ */
const countySelect = document.getElementById("p-county");
KENYA_COUNTIES.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c; opt.textContent = c;
  countySelect.appendChild(opt);
});

document.getElementById("form-personal").addEventListener("submit", e => {
  e.preventDefault();
  const fullname = document.getElementById("p-fullname").value.trim();
  const idnumber = document.getElementById("p-idnumber").value.trim();
  const dob = document.getElementById("p-dob").value;
  const gender = document.getElementById("p-gender").value;
  const county = document.getElementById("p-county").value;
  const constituency = document.getElementById("p-constituency").value.trim();
  clearErrors("p-fullname","p-idnumber","p-dob","p-gender","p-county","p-constituency");

  let valid = true;
  if(fullname.split(" ").filter(Boolean).length < 2){
    setError("p-fullname", "Enter your full name as on your ID");
    valid = false;
  }
  if(!/^\d{6,10}$/.test(idnumber)){
    setError("p-idnumber", "Enter a valid National ID number");
    valid = false;
  }
  if(!dob){
    setError("p-dob", "Enter your date of birth");
    valid = false;
  }else{
    const age = ageFromDob(dob);
    if(age < 18){
      setError("p-dob", "You must be at least 18 years old");
      valid = false;
    }
  }
  if(!gender){ setError("p-gender", "Select an option"); valid = false; }
  if(!county){ setError("p-county", "Select your county"); valid = false; }
  if(!constituency){ setError("p-constituency", "Enter your constituency"); valid = false; }
  if(!valid) return;

  Object.assign(state.data, {fullname, idnumber, dob, gender, county, constituency});
  saveState();
  showScreen("employment");
});

function ageFromDob(dobStr){
  const dob = new Date(dobStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if(m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

/* ============ EMPLOYMENT ============ */
const employerField = document.getElementById("field-employer");
document.getElementById("e-type").addEventListener("change", e => {
  const needsEmployer = ["government","private","self","business"].includes(e.target.value);
  employerField.style.display = needsEmployer ? "" : "none";
});
employerField.style.display = "none";

document.getElementById("form-employment").addEventListener("submit", e => {
  e.preventDefault();
  const type = document.getElementById("e-type").value;
  const employer = document.getElementById("e-employer").value.trim();
  clearErrors("e-type","e-employer");

  let valid = true;
  if(!type){ setError("e-type", "Select your employment type"); valid = false; }
  const needsEmployer = ["government","private","self","business"].includes(type);
  if(needsEmployer && !employer){
    setError("e-employer", "Enter your employer or business name");
    valid = false;
  }
  if(!valid) return;

  state.data.employmentType = type;
  state.data.employer = needsEmployer ? employer : "";
  saveState();
  showScreen("income");
});

/* ============ INCOME ============ */
document.getElementById("form-income").addEventListener("submit", e => {
  e.preventDefault();
  const selected = document.querySelector('input[name="income"]:checked');
  clearErrors();
  document.getElementById("err-income").textContent = "";
  if(!selected){
    document.getElementById("err-income").textContent = "Select your income range";
    return;
  }
  state.data.income = selected.value;
  saveState();
  showScreen("education");
});

/* ============ EDUCATION ============ */
document.getElementById("form-education").addEventListener("submit", e => {
  e.preventDefault();
  const selected = document.querySelector('input[name="education"]:checked');
  document.getElementById("err-education").textContent = "";
  if(!selected){
    document.getElementById("err-education").textContent = "Select your highest level of education";
    return;
  }
  state.data.education = selected.value;
  saveState();
  showScreen("guarantor");
});

/* ============ GUARANTOR ============ */
document.getElementById("form-guarantor").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("g-name").value.trim();
  const phone = document.getElementById("g-phone").value.trim();
  const relationship = document.getElementById("g-relationship").value;
  clearErrors("g-name","g-phone","g-relationship");

  let valid = true;
  if(name.split(" ").filter(Boolean).length < 2){
    setError("g-name", "Enter the guarantor's full name");
    valid = false;
  }
  if(!isValidKenyanPhone(phone)){
    setError("g-phone", "Enter a valid Kenyan mobile number");
    valid = false;
  }
  if(!relationship){
    setError("g-relationship", "Select a relationship");
    valid = false;
  }
  if(!valid) return;

  state.data.guarantorName = name;
  state.data.guarantorPhone = normalizePhone(phone);
  state.data.guarantorRelationship = relationship;
  saveState();
  renderReview();
  showScreen("review");
});

/* ============ REVIEW ============ */
const EMPLOYMENT_LABELS = {
  government: "Government employee", private: "Private employee", self: "Self-employed",
  business: "Business owner", casual: "Casual worker", student: "Student", unemployed: "Unemployed"
};
const INCOME_LABELS = {
  "5000-12000": "KSh 5,000 – 12,000", "12001-18000": "KSh 12,001 – 18,000",
  "18001-25000": "KSh 18,001 – 25,000", "25001-44000": "KSh 25,001 – 44,000",
  "44001-60000": "KSh 44,001 – 60,000", "60001+": "Above KSh 60,000", "none": "No regular income"
};
const EDUCATION_LABELS = {
  primary: "Primary", secondary: "Secondary", certificate: "Certificate",
  diploma: "Diploma", university: "University", postgraduate: "Postgraduate"
};

function renderReview(){
  const d = state.data;
  const items = [
    ["Full name", d.fullname],
    ["National ID", d.idnumber],
    ["Mobile number", d.phone],
    ["Date of birth", d.dob],
    ["Gender", d.gender],
    ["County", d.county],
    ["Constituency", d.constituency],
    ["Employment", EMPLOYMENT_LABELS[d.employmentType] || "—"],
    ["Employer/Business", d.employer || "—"],
    ["Monthly income", INCOME_LABELS[d.income] || "—"],
    ["Education", EDUCATION_LABELS[d.education] || "—"],
    ["Guarantor", d.guarantorName],
    ["Guarantor phone", d.guarantorPhone],
    ["Relationship", d.guarantorRelationship],
  ];
  const grid = document.getElementById("review-grid");
  grid.innerHTML = items.map(([label,val]) => 
    `<div class="review-item"><span>${label}</span><span>${escapeHtml(val || "—")}</span></div>`
  ).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ============ TERMS + SUBMIT ============ */
document.getElementById("form-terms").addEventListener("submit", e => {
  e.preventDefault();
  const checked = document.getElementById("terms-check").checked;
  document.getElementById("err-terms").textContent = "";
  if(!checked){
    document.getElementById("err-terms").textContent = "You must agree to the Terms & Conditions and Privacy Policy to continue";
    return;
  }
  state.data.appliedAt = new Date().toISOString();
  state.data.reference = generateReference();
  saveState();
  showScreen("processing");
  runProcessing();
});

function generateReference(){
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `HK-${digits}`;
}

/* ============ PROCESSING ANIMATION ============ */
function runProcessing(){
  const steps = document.querySelectorAll("#processing-steps li");
  const ringProgress = document.getElementById("ring-progress");
  const ringPct = document.getElementById("ring-pct");
  const circumference = 2 * Math.PI * 52;
  ringProgress.style.strokeDasharray = circumference;
  ringProgress.style.strokeDashoffset = circumference;
  steps.forEach(s => s.classList.remove("active","done"));

  let i = 0;
  function nextStep(){
    if(i > 0) steps[i-1].classList.remove("active");
    if(i > 0) steps[i-1].classList.add("done");
    if(i >= steps.length){
      setTimeout(() => finishApplication(), 500);
      return;
    }
    steps[i].classList.add("active");
    const pct = Math.round(((i+1) / steps.length) * 100);
    const offset = circumference - (pct/100) * circumference;
    ringProgress.style.strokeDashoffset = offset;
    ringPct.textContent = pct + "%";
    i++;
    setTimeout(nextStep, 900);
  }
  nextStep();
}

/* ============ ELIGIBILITY CALCULATION ============ */
function calculateOffer(){
  const d = state.data;

  const noIncomeEmployment = ["student","unemployed"].includes(d.employmentType);
  const noIncomeSelected = d.income === "none";

  if(noIncomeEmployment || noIncomeSelected){
    return { approved: false };
  }

  const bands = {
    "5000-12000":   { min: 8000,  max: 15000,  term: 60 },
    "12001-18000":  { min: 15000, max: 25000,  term: 75 },
    "18001-25000":  { min: 25000, max: 35000,  term: 90 },
    "25001-44000":  { min: 35000, max: 60000,  term: 120 },
    "44001-60000":  { min: 60000, max: 90000,  term: 150 },
    "60001+":       { min: 90000, max: 150000, term: 180 }
  };
  const band = bands[d.income];
  if(!band) return { approved: false };

  // Employment type adjusts the offered amount within the band
  const typeMultiplier = {
    government: 1.0, private: 0.9, business: 0.85, self: 0.75, casual: 0.6
  }[d.employmentType] ?? 0.7;

  let amount = Math.round((band.min + (band.max - band.min) * typeMultiplier) / 100) * 100;
  amount = Math.min(amount, band.max);
  amount = Math.max(amount, band.min);

  const maxAmount = band.max;
  const termDays = band.term;
  // Simple flat-rate estimate for demonstration purposes: 10% flat fee over the term
  const totalRepayable = Math.round(amount * 1.10);
  const monthlyRepayment = Math.round(totalRepayable / (termDays / 30));

  return { approved: true, amount, maxAmount, termDays, monthlyRepayment };
}

function finishApplication(){
  const result = calculateOffer();
  state.data.approved = result.approved;

  if(!result.approved){
    saveState();
    showScreen("decline");
    return;
  }

  state.data.offerAmount = result.amount;
  state.data.maxAmount = result.maxAmount;
  state.data.termDays = result.termDays;
  state.data.monthlyRepayment = result.monthlyRepayment;
  saveState();
  renderOffer();
  showScreen("offer");
}

function renderOffer(){
  const d = state.data;
  document.getElementById("offer-amount").textContent = `KSh ${d.offerAmount.toLocaleString()}`;
  document.getElementById("offer-ref").textContent = d.reference;
  document.getElementById("offer-max").textContent = `KSh ${d.maxAmount.toLocaleString()}`;
  document.getElementById("offer-term").textContent = `${d.termDays} days`;
  document.getElementById("offer-monthly").textContent = `KSh ${d.monthlyRepayment.toLocaleString()} / month (est.)`;
}

/* ============ DASHBOARD ============ */
function renderDashboard(){
  const d = state.data;
  document.getElementById("dash-name").textContent = d.fullname || "Applicant";
  document.getElementById("dash-phone").textContent = d.phone || "—";
  document.getElementById("dash-ref").textContent = d.reference || "—";
  document.getElementById("dash-amount").textContent = d.offerAmount ? `KSh ${d.offerAmount.toLocaleString()}` : "—";
  document.getElementById("dash-date").textContent = d.appliedAt ? new Date(d.appliedAt).toLocaleDateString("en-KE", {year:"numeric", month:"long", day:"numeric"}) : "—";
  document.getElementById("dash-status").textContent = "Application Received";
}

/* ============ GLOBAL ACTIONS ============ */
document.addEventListener("click", e => {
  const actionEl = e.target.closest("[data-action]");
  if(actionEl){
    const action = actionEl.dataset.action;
    if(action === "start-application"){
      showScreen("register");
    }else if(action === "go-dashboard"){
      renderDashboard();
      showScreen("dashboard");
    }else if(action === "go-home"){
      resetApplication();
      showScreen("landing");
    }
    document.getElementById("mainNav").classList.remove("active");
    document.getElementById("hamburger").classList.remove("active");
  }

  const backEl = e.target.closest("[data-back]");
  if(backEl){ goBack(); }

  const staticLink = e.target.closest("[data-static-link]");
  if(staticLink){
    e.preventDefault();
    openStaticModal(staticLink.textContent.trim());
  }

  const navLink = e.target.closest(".nav-link");
  if(navLink && navLink.tagName === "A"){
    document.getElementById("mainNav").classList.remove("active");
    document.getElementById("hamburger").classList.remove("active");
  }

  const brandLink = e.target.closest('[data-nav="landing"]');
  if(brandLink){
    e.preventDefault();
    showScreen("landing");
  }
});

function resetApplication(){
  state.screenHistory = [];
}

/* ============ STATIC INFO MODAL ============ */
const STATIC_CONTENT = {
  "About Us": "Haraka Loans is a coursework prototype demonstrating a digital lending application flow for a software engineering class presentation. It is not a licensed financial institution.",
  "Contact Us": "This is a demo build. In a live product, this page would list a support phone line, email address, and office hours.",
  "Privacy Policy": "In this demo, all information you enter stays on your own device in local browser storage and is never transmitted to a server.",
  "Terms & Conditions": "This is placeholder text for a coursework demo. A live lender would publish full loan terms, interest rates, and borrower obligations here.",
  "Responsible Lending": "A live lender would use this page to explain affordability checks, borrower protections, and how to seek help if repayment becomes difficult.",
  "Help Centre": "This is a demo build with no live support channel. In a real product, this page would host guides and a way to reach customer support."
};
function openStaticModal(title){
  document.getElementById("staticModalTitle").textContent = title;
  document.getElementById("staticModalBody").textContent = STATIC_CONTENT[title] || "Content coming soon.";
  document.getElementById("staticModalBackdrop").classList.add("active");
}
document.getElementById("staticModalClose").addEventListener("click", () => {
  document.getElementById("staticModalBackdrop").classList.remove("active");
});
document.getElementById("staticModalBackdrop").addEventListener("click", e => {
  if(e.target.id === "staticModalBackdrop") e.target.classList.remove("active");
});

/* ============ HAMBURGER MENU ============ */
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("mainNav");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  mainNav.classList.toggle("active");
});
document.addEventListener("click", e => {
  if(!mainNav.contains(e.target) && !hamburger.contains(e.target)){
    hamburger.classList.remove("active");
    mainNav.classList.remove("active");
  }
});

/* ============ INIT ============ */
loadState();
showScreen("landing", {skipHistory:true});