// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_hLdWDYdBsZFmhTFpg4QIzdOiB9JxxIw",
  authDomain: "nfa-main.firebaseapp.com",
  databaseURL: "https://nfa-main-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nfa-main",
  storageBucket: "nfa-main.firebasestorage.app",
  messagingSenderId: "314192469082",
  appId: "1:314192469082:web:2f301895179a22dbe68c63",
  measurementId: "G-ZEJP0S67SY"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Test connection
console.log("Firebase initialized:", firebase.apps.length > 0);

/* LOAD SIDEBAR */
fetch("sidebar.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("goHome").onclick = () => location.href = "homepage.html";
    document.getElementById("goAcc").onclick = () => location.href = "accountable.html";
    document.getElementById("goTrans").onclick = () => location.href = "transaction.html";
    document.getElementById("goInv").onclick = () => location.href = "inventory.html";
  })
  .catch(error => {
    console.error("Error loading sidebar:", error);
  });

const officerModal = document.getElementById("officerModal");
const transactionModal = document.getElementById("transactionModal");

/* LOAD OFFICERS FROM FIREBASE */
function loadOfficersFromFirebase() {
  console.log("Loading officers from Firebase...");
  const officersRef = database.ref('accountableOfficers');
  const tbody = document.querySelector("#officerModal tbody");
  
  officersRef.once('value')
    .then((snapshot) => {
      console.log("Data received:", snapshot.exists());
      tbody.innerHTML = ""; // Clear table

      if (!snapshot.exists()) {
        console.log("No data in database");
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No officers added yet</td></tr>';
        return;
      }

      snapshot.forEach((childSnapshot) => {
        const docId = childSnapshot.key;
        const data = childSnapshot.val();
        console.log("Officer:", docId, data);
        
        // Format period display
        let periodFrom = data.fromDate || "";
        let periodTo = data.toDate || "";
        let periodDisplay = "";
        if (periodFrom && periodTo) {
          periodDisplay = `${periodFrom} / ${periodTo}`;
        } else if (periodFrom || periodTo) {
          periodDisplay = `${periodFrom}${periodTo}`;
        } else {
          periodDisplay = "-";
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.officerId || "-"}</td>
          <td>${data.lastName || "-"}</td>
          <td>${data.firstName || "-"}</td>
          <td>${data.middleName || "-"}</td>
          <td>${data.warehouse || "-"}</td>
          <td>${data.warehouseName || "-"}</td>
          <td>${periodDisplay}</td>
          <td><button class="selectOfficer">Select</button></td>
        `;
        
        tbody.appendChild(tr);
      });

      // Reattach event listeners after loading data
      attachOfficerSelectListeners();
    })
    .catch((error) => {
      console.error("Error loading officers:", error);
      alert("Error loading data: " + error.message);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Error loading officers</td></tr>';
    });
}

/* STEP 1: OPEN OFFICER TABLE */
document.getElementById("addTransaction").onclick = () => {
  loadOfficersFromFirebase(); // Load fresh data when modal opens
  officerModal.style.display = "block";
};

/* CLOSE MODALS */
document.getElementById("closeOfficer").onclick = () => officerModal.style.display = "none";
document.getElementById("closeTransaction").onclick = () => transactionModal.style.display = "none";

/* STEP 2: SELECT OFFICER */
function attachOfficerSelectListeners() {
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
      document.getElementById("periodFrom").value = period[0] || "";
      document.getElementById("periodTo").value = period[1] || "";

      // Close Officer modal and open Transaction modal
      officerModal.style.display = "none";
      transactionModal.style.display = "block";
    });
  });
}

/* SAVE TRANSACTION TO FIREBASE */
document.getElementById("transactionForm").onsubmit = e => {
  e.preventDefault();
  
  // Get form reference
  const form = e.target;
  
  // Get all form inputs in order
  const textInputs = form.querySelectorAll('input[type="text"]');
  const numberInputs = form.querySelectorAll('input[type="number"]');
  const selects = form.querySelectorAll('select');
  const checkbox = form.querySelector('input[type="checkbox"]');
  const dateInput = form.querySelector('input[type="date"]');
  
  // Collect all transaction data
  const transactionData = {
    // Accountability Information
    officerId: document.getElementById("officerId").value,
    officerName: document.getElementById("officerName").value,
    warehouseId: document.getElementById("warehouseId").value,
    warehouseName: document.getElementById("warehouseName").value,
    periodFrom: document.getElementById("periodFrom").value,
    periodTo: document.getElementById("periodTo").value,
    
    // Transaction Details
    documentNo: textInputs[0].value || "",
    cancelled: checkbox.checked,
    documentType: selects[0].value || "",
    orNo: textInputs[1].value || "",
    aiNo: textInputs[2].value || "",
    refWSINo: textInputs[3].value || "",
    recdFromIssdTo: textInputs[4].value || "",
    transactionDate: dateInput.value || "",
    activityCode: textInputs[5].value || "",
    varietyCode: textInputs[6].value || "",
    sackCode: textInputs[7].value || "",
    sackCondition: selects[1].value || "",
    sackWeight: parseFloat(document.getElementById("sackWeight").value) || 0,
    age: parseFloat(numberInputs[1].value) || 0,
    pileNo: parseFloat(numberInputs[2].value) || 0,
    numberOfBags: parseFloat(numberInputs[3].value) || 0,
    grossWeight: parseFloat(document.getElementById("grossWeight").value) || 0,
    moistureContent: parseFloat(numberInputs[5].value) || 0,
    netWeight: parseFloat(document.getElementById("netWeight").value) || 0,
    
    // Metadata
    createdAt: new Date().toISOString(),
    timestamp: Date.now()
  };
  
  console.log("Saving transaction:", transactionData);
  
  // Save to Firebase
  const transactionsRef = database.ref('transactions');
  const newTransactionRef = transactionsRef.push();
  
  newTransactionRef.set(transactionData)
    .then(() => {
      console.log("Transaction saved successfully!");
      alert("Transaction saved successfully!");
      transactionModal.style.display = "none";
      form.reset();
      
      // Clear readonly fields
      document.getElementById("officerId").value = "";
      document.getElementById("officerName").value = "";
      document.getElementById("warehouseId").value = "";
      document.getElementById("warehouseName").value = "";
      document.getElementById("periodFrom").value = "";
      document.getElementById("periodTo").value = "";
      document.getElementById("netWeight").value = "";
      document.getElementById("sackWeight").value = "";
      document.getElementById("grossWeight").value = "";
    })
    .catch((error) => {
      console.error("Error saving transaction:", error);
      alert("Error saving transaction: " + error.message);
    });
};

/* NET WEIGHT COMPUTATION */
const gross = document.getElementById("grossWeight");
const sack = document.getElementById("sackWeight");
const net = document.getElementById("netWeight");

function computeNetWeight() {
  const g = parseFloat(gross.value) || 0;
  const s = parseFloat(sack.value) || 0;
  net.value = (g - s).toFixed(2);
}

gross.addEventListener("input", computeNetWeight);
sack.addEventListener("input", computeNetWeight);

// Load officers when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log("Transaction page loaded");
});

/* LOAD TRANSACTIONS FROM FIREBASE */
function loadTransactions() {
  const tbody = document.getElementById("inventoryBody");
  
  if (!tbody) {
    console.error("inventoryBody element not found");
    return;
  }
  
  const transactionsRef = database.ref("transactions");

  console.log("Loading transactions...");

  transactionsRef.on("value", (snapshot) => {
    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `
        <tr>
          <td colspan="24" style="text-align:center;">No transactions found</td>
        </tr>`;
      return;
    }

    let transactionCount = 0;
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      transactionCount++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.officerId || "-"}</td>
        <td>${data.officerName || "-"}</td>
        <td>${data.warehouseId || "-"}</td>
        <td>${data.warehouseName || "-"}</td>
        <td>${data.periodFrom || "-"}</td>
        <td>${data.periodTo || "-"}</td>
        <td>${data.documentNo || "-"}</td>
        <td>${data.cancelled ? "Yes" : "No"}</td>
        <td>${data.documentType || "-"}</td>
        <td>${data.orNo || "-"}</td>
        <td>${data.aiNo || "-"}</td>
        <td>${data.refWSINo || "-"}</td>
        <td>${data.recdFromIssdTo || "-"}</td>
        <td>${data.transactionDate || "-"}</td>
        <td>${data.activityCode || "-"}</td>
        <td>${data.varietyCode || "-"}</td>
        <td>${data.sackCode || "-"}</td>
        <td>${data.sackCondition || "-"}</td>
        <td>${data.sackWeight || 0}</td>
        <td>${data.age || 0}</td>
        <td>${data.pileNo || 0}</td>
        <td>${data.numberOfBags || 0}</td>
        <td>${data.grossWeight || 0}</td>
        <td>${data.moistureContent || 0}</td>
        <td>${data.netWeight || 0}</td>
      `;

      tbody.appendChild(tr);
    });
    
    console.log(`Loaded ${transactionCount} transactions`);
  }, (error) => {
    console.error("Error loading transactions:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="24" style="text-align:center; color: red;">Error loading transactions: ${error.message}</td>
      </tr>`;
  });
}

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  console.log("Inventory page loaded");
  loadTransactions();
});