const DEPARTMENTS = [
"Office of the Municipal Mayor","Office of the Municipal Administrator","Chief of Staff – Office of Municipal Mayor","Bureau of Fire Protection (BFP)","Philippine National Police (PNP)","Office of the Sangguniang Bayan","Office of the Secretary to the Sangguniang Bayan","Municipal Health Office","Municipal Agriculturist Office","Municipal Treasurer's Office","Municipal Accounting Office","Municipal Social Welfare and Development Office","Municipal Civil Registrar Office","Municipal Assessor's Office","Municipal Planning and Development Coordinator's Office","Municipal Human Resource Management Office","Municipal Interior and Local Government Operations Office","Municipal Engineering Office","Municipal Budget Office","Municipal Disaster Risk Reduction and Management Office","Municipal General Services Office","Pambayang Kapisanan ng mga Barangay"
];
const MANDATORY = ["DEPARTMENT","DATE","REQUESTED_BY","UNIT","ITEM_DESCRIPTION","QTY","UNIT_COST"];
const OPTIONAL_PINK = ["PR","BUDGET","BAC"];
let lineItems = 1;

function fieldsTemplate(i) {
  return ["GSOID","PR","BUDGET","BAC","DEPARTMENT","DATE","REQUESTED_BY","UNIT","ITEM_DESCRIPTION","QTY","UNIT_COST","SECTION","STOCK_NO","TOTAL_COST","REMARKS"].map(f => {
    const id = `${f}_${i}`;
    if (f === "DEPARTMENT") {
      return `<label class='text-sm'>${f}*<select id='${id}' class='border rounded p-2 w-full'>${DEPARTMENTS.map(d => `<option>${d}</option>`).join("")}</select></label>`;
    }
    const type = f.includes("DATE") ? "date" : (f === "QTY" || f.includes("COST") ? "number" : "text");
    const cls = OPTIONAL_PINK.includes(f) ? "input-optional" : "border";
    const placeholder = OPTIONAL_PINK.includes(f) ? "PLEASE LEAVE THIS BLANK" : "";
    const ro = f === "GSOID" || f === "TOTAL_COST" ? "readonly" : "";
    return `<label class='text-sm'>${f}${MANDATORY.includes(f) ? "*" : ""}<input ${ro} id='${id}' type='${type}' class='${cls} rounded p-2 w-full' placeholder='${placeholder}'/></label>`;
  }).join("");
}

function buildForm() {
  const form = document.getElementById("prForm");
  form.innerHTML = "";
  for (let i = 1; i <= lineItems; i++) {
    const block = document.createElement("div");
    block.className = "md:col-span-2 grid md:grid-cols-2 gap-3 p-3 border rounded";
    block.innerHTML = `<h4 class='md:col-span-2 font-semibold'>Line Item ${i}</h4>${fieldsTemplate(i)}`;
    form.appendChild(block);
    document.getElementById(`GSOID_${i}`).value = generateGSOID();
    ["QTY","UNIT_COST"].forEach(k => document.getElementById(`${k}_${i}`).addEventListener("input", () => computeTotal(i)));
  }
}

function computeTotal(i) {
  const q = Number(document.getElementById(`QTY_${i}`).value || 0);
  const c = Number(document.getElementById(`UNIT_COST_${i}`).value || 0);
  document.getElementById(`TOTAL_COST_${i}`).value = (q*c).toFixed(2);
}

function generateGSOID() {
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  const xxx = String(Math.floor(Math.random()*1000)).padStart(3,'0');
  return `GSOID${mm}${dd}${yy}${xxx}`;
}

function validate() {
  let ok = true;
  document.querySelectorAll("input,select").forEach(el => el.classList.remove("input-error"));
  for (let i=1;i<=lineItems;i++) {
    MANDATORY.forEach(f => {
      const el = document.getElementById(`${f}_${i}`);
      if (el && !el.value) { ok = false; el.classList.add("input-error"); }
    });
  }
  return ok;
}

window.addLineItem = () => { lineItems++; buildForm(); };
window.submitPR = () => {
  const s = document.getElementById("prStatus");
  if (!validate()) { s.textContent = "Validation Error: Please fill all mandatory fields (*)"; s.className = "text-red-600 mt-2 text-sm"; return; }
  s.textContent = "Purchase Request submitted. Copy is printable as 'Pending Approval'.";
  s.className = "text-emerald-600 mt-2 text-sm";
};
window.simulateRIS = (path) => {
  document.getElementById("risStatus").textContent = path === 'A' ? "RIS Path A sent to Admin for approval." : "Bulk DR linked; auto-generated RIS ready for issuance.";
};
window.selectRole = (r) => {
  if (!document.getElementById("acceptTerms").checked) return alert("Please accept terms first.");
  sessionStorage.setItem("gso_role", r);
  initRole();
};

function rootLoginCheck(username, password) {
  return ["LEE","lee"].includes(username) && ["metallica","METALLICA"].includes(password);
}

function initRole() {
  const role = sessionStorage.getItem("gso_role");
  document.getElementById("roleSplash").classList.toggle("hidden", !!role);
  document.getElementById("appPanel").classList.toggle("hidden", !role);
  document.getElementById("sessionNotice").textContent = role ? `Active role: ${role}` : "No role selected";
}

(function initPWA(){
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
})();

window.addEventListener("DOMContentLoaded", () => { buildForm(); initRole(); });

// Facebook SDK
window.fbAsyncInit = function() { FB.init({ xfbml: true, version: 'v19.0' }); };
(function(d, s, id) { let js; const fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js'; fjs.parentNode.insertBefore(js, fjs);} (document, 'script', 'facebook-jssdk'));
