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

// Global variable to store transactions
let allTransactions = [];

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

/* PREVIEW BUTTON - Opens new window with print preview */
document.getElementById("previewTransaction").onclick = () => {
  window.open("preview.html", "_blank");
};

/* RENDER TRANSACTIONS TO BOTH TABLES */
function renderInventory() {
  const gid1Body = document.getElementById("inventoryBody");
  const gid2Body = document.getElementById("inventoryBody2");
  
  // Separate transactions by GID
  const gid1Transactions = [];
  const gid2Transactions = [];
  
  allTransactions.forEach(item => {
    const data = item.data;
    
    // Check varietyCode to determine which table
    if (data.varietyCode === "GID 1" || data.varietyCode === "1" || data.varietyCode === "GID1") {
      gid1Transactions.push(data);
    } else if (data.varietyCode === "GID 2" || data.varietyCode === "2" || data.varietyCode === "GID2") {
      gid2Transactions.push(data);
    }
  });
  
  // Render GID 1 table
  if (gid1Transactions.length === 0) {
    gid1Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">No GID 1 inventory found</td></tr>';
  } else {
    gid1Body.innerHTML = "";
    gid1Transactions.forEach(data => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.pileNo || "-"}</td>
        <td>${data.varietyCode || "-"}</td>
        <td>${data.numberOfBags || 0}</td>
        <td>${data.netWeight || 0}</td>
        <td>${data.age || 0}</td>
      `;
      gid1Body.appendChild(tr);
    });
  }
  
  // Render GID 2 table
  if (gid2Transactions.length === 0) {
    gid2Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">No GID 2 inventory found</td></tr>';
  } else {
    gid2Body.innerHTML = "";
    gid2Transactions.forEach(data => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.pileNo || "-"}</td>
        <td>${data.varietyCode || "-"}</td>
        <td>${data.numberOfBags || 0}</td>
        <td>${data.netWeight || 0}</td>
        <td>${data.age || 0}</td>
      `;
      gid2Body.appendChild(tr);
    });
  }
  
  console.log(`Rendered ${gid1Transactions.length} GID 1 items and ${gid2Transactions.length} GID 2 items`);
}

/* LOAD TRANSACTIONS FROM FIREBASE */
function loadInventory() {
  const gid1Body = document.getElementById("inventoryBody");
  const gid2Body = document.getElementById("inventoryBody2");
  
  if (!gid1Body || !gid2Body) {
    console.error("Table bodies not found");
    return;
  }
  
  const transactionsRef = database.ref("transactions");

  console.log("Loading inventory...");

  transactionsRef.on("value", (snapshot) => {
    allTransactions = []; // Clear the array

    if (!snapshot.exists()) {
      renderInventory();
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const docId = childSnapshot.key;
      
      allTransactions.push({
        docId: docId,
        data: data
      });
    });
    
    console.log(`Loaded ${allTransactions.length} transactions`);
    
    // Render inventory
    renderInventory();
  }, (error) => {
    console.error("Error loading inventory:", error);
    gid1Body.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Error loading inventory: ${error.message}</td></tr>`;
    gid2Body.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Error loading inventory: ${error.message}</td></tr>`;
  });
}

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  console.log("Inventory page loaded");
  loadInventory();
});