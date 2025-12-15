/* LOAD SIDEBAR */
fetch("sidebar.html")
  .then(r => r.text())
  .then(html => {
    sidebar.innerHTML = html;
    goHome.onclick = () => location.href="homepage.html";
    goAcc.onclick = () => location.href="accountable.html";
    goTrans.onclick = () => location.href="transaction.html";
  });

const officerModal = document.getElementById("officerModal");
const transactionModal = document.getElementById("transactionModal");

/* STEP 1: OPEN OFFICER TABLE */
document.getElementById("addTransaction").onclick = () => {
  officerModal.style.display = "block";
};

/* CLOSE MODALS */
document.getElementById("closeOfficer").onclick = () => officerModal.style.display = "none";
document.getElementById("closeTransaction").onclick = () => transactionModal.style.display = "none";

/* STEP 2: SELECT OFFICER */
document.querySelectorAll(".selectOfficer").forEach(btn => {
  btn.addEventListener("click", function () {
    const row = this.closest("tr");

    // Set Officer info
    document.getElementById("officerId").value = row.children[0].textContent;
    document.getElementById("officerName").value =
      row.children[1].textContent + ", " + row.children[2].textContent + " " + row.children[3].textContent;

    // Set Warehouse info
    document.getElementById("warehouseId").value = row.children[4].textContent;
    document.getElementById("warehouseName").value = row.children[5].textContent;

    // Set Period
    const period = row.children[6].textContent.split(" / ");
    document.getElementById("periodFrom").value = period[0];
    document.getElementById("periodTo").value = period[1];

    // Close Officer modal and open Transaction modal
    officerModal.style.display = "none";
    transactionModal.style.display = "block";
  });
});

/* SAVE TRANSACTION */
document.getElementById("transactionForm").onsubmit = e => {
  e.preventDefault();
  alert("Transaction saved.");
  transactionModal.style.display = "none";
  e.target.reset();
};

/* NET WEIGHT COMPUTATION */
const gross = document.getElementById("grossWeight");
const sack = document.getElementById("sackWeight");
const net = document.getElementById("netWeight");

function computeNetWeight() {
  const g = parseFloat(gross.value) || 0;
  const s = parseFloat(sack.value) || 0;
  net.value = g - s;
}

gross.addEventListener("input", computeNetWeight);
sack.addEventListener("input", computeNetWeight);
