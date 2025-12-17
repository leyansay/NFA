// ============================
// FIREBASE CONFIG
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyB_hLdWDYdBsZFmhTFpg4QIzdOiB9JxxIw",
  authDomain: "nfa-main.firebaseapp.com",
  databaseURL: "https://nfa-main-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nfa-main",
  storageBucket: "nfa-main.firebasestorage.app",
  messagingSenderId: "314192469082",
  appId: "1:314192469082:web:2f301895179a22dbe68c63"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

console.log("Firebase initialized");

// ============================
// GLOBAL STATE
// ============================
let allTransactions = [];
let currentType = "Rice";

// ============================
// SIDEBAR
// ============================
fetch("sidebar.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("goHome").onclick = () => location.href = "homepage.html";
    document.getElementById("goAcc").onclick = () => location.href = "accountable.html";
    document.getElementById("goTrans").onclick = () => location.href = "transaction.html";
    document.getElementById("goInv").onclick = () => location.href = "inventory.html";
  });

// ============================
// USER DROPDOWN
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userInfoDropdown");
  const userDropdown = document.getElementById("userDropdown");

  if (userInfo && userDropdown) {
    userInfo.addEventListener("click", e => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }
});

// ============================
// PREVIEW BUTTON
// ============================
document.getElementById("previewTransaction")?.addEventListener("click", () => {
  window.open("preview.html", "_blank");
});

// ============================
// RENDER INVENTORY
// ============================
function renderInventory(data = allTransactions) {
  const gid1Body = document.getElementById("inventoryBody");
  const gid2Body = document.getElementById("inventoryBody2");

  gid1Body.innerHTML = "";
  gid2Body.innerHTML = "";

  const filtered = data.filter(i => i.data.type === currentType);

  const gid1 = filtered.filter(i => i.data.varietyCode?.includes("1"));
  const gid2 = filtered.filter(i => i.data.varietyCode?.includes("2"));

  renderRows(gid1Body, gid1);
  renderRows(gid2Body, gid2);
}

function renderRows(tbody, rows) {
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" align="center">No data</td></tr>`;
    return;
  }

  rows.forEach(({ data }) => {
    tbody.innerHTML += `
      <tr>
        <td>${data.pileNo || "-"}</td>
        <td>${data.age || "-"}</td>
        <td>${data.variety || "-"}</td>
        <td>${data.numberOfBags || 0}</td>
        <td>${data.netWeight || 0}</td>
      </tr>
    `;
  });
}

// ============================
// LOAD FROM FIREBASE
// ============================
function loadInventory() {
  database.ref("transactions").on("value", snapshot => {
    allTransactions = [];

    snapshot.forEach(child => {
      allTransactions.push({
        docId: child.key,
        data: child.val()
      });
    });

    renderInventory();
  });
}

// ============================
// BUTTONS + SUBHEADER
// ============================
const btnRice = document.getElementById("viewRice");
const btnPalay = document.getElementById("viewPalay");
const subHeader = document.getElementById("inventorySubHeader");

btnRice.classList.add("active-btn");

btnRice.addEventListener("click", () => {
  currentType = "Rice";
  btnRice.classList.add("active-btn");
  btnPalay.classList.remove("active-btn");
  renderInventory();
});

btnPalay.addEventListener("click", () => {
  currentType = "Palay";
  btnPalay.classList.add("active-btn");
  btnRice.classList.remove("active-btn");
  renderInventory();
});

// ============================
// SEARCH (FIREBASE-BASED)
// ============================
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();

  const filtered = allTransactions.filter(item => {
    const d = item.data;
    return (
      d.type === currentType &&
      (
        d.pileNo?.toString().includes(q) ||
        d.variety?.toLowerCase().includes(q) ||
        d.varietyCode?.toLowerCase().includes(q) ||
        d.numberOfBags?.toString().includes(q) ||
        d.netWeight?.toString().includes(q)
      )
    );
  });

  renderInventory(filtered);
});

// ============================
// INIT
// ============================
window.addEventListener("DOMContentLoaded", loadInventory);
