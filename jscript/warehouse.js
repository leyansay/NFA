// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
  apiKey: "AIzaSyB_hLdWDYdBsZFmhTFpg4QIzdOiB9JxxIw",
  authDomain: "nfa-main.firebaseapp.com",
  databaseURL: "https://nfa-main-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nfa-main",
  storageBucket: "nfa-main.firebasestorage.app",
  messagingSenderId: "314192469082",
  appId: "1:314192469082:web:2f301895179a22dbe68c63"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ===================== ELEMENTS =====================
const warehouseForm = document.getElementById("warehouseForm");
const warehouseCode = document.getElementById("warehouseCode");
const warehouseName = document.getElementById("warehouseName");
const locationInput = document.getElementById("location");
const warehouseModal = document.getElementById("warehouseModal");
const sortSelect = document.getElementById("sortSelect");

// ===================== GLOBAL =====================
let allWarehouses = [];
let currentSortOrder = 'newest';

// ===================== LOAD =====================
function loadWarehouses() {
  const tbody = document.getElementById("warehouseBody");

  database.ref("warehouses").on("value", snapshot => {
    allWarehouses = [];
    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No warehouses found</td></tr>`;
      return;
    }

    snapshot.forEach(child => {
      allWarehouses.push({ id: child.key, data: child.val() });
    });

    sortWarehouses(currentSortOrder);
  });
}

// ===================== SORT =====================
function sortWarehouses(order) {
  currentSortOrder = order;
  allWarehouses.sort((a,b) =>
    order === 'newest'
      ? b.data.timestamp - a.data.timestamp
      : a.data.timestamp - b.data.timestamp
  );
  renderWarehouses();
}

// ===================== RENDER =====================
function renderWarehouses() {
  const tbody = document.getElementById("warehouseBody");
  tbody.innerHTML = "";

  allWarehouses.forEach(item => {
    const d = item.data;
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.warehouseCode}</td>
      <td>${d.warehouseName}</td>
      <td>${d.location}</td>
      <td class="action-cell">
        <span class="dot-menu">&#8942;</span>
        <div class="dropdown-content">
          <button class="edit-btn" data-id="${item.id}">Edit</button>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachDropdownListeners();
}

// ===================== DROPDOWN =====================
function attachDropdownListeners() {
  document.querySelectorAll('.dot-menu').forEach(dot => {
    dot.onclick = e => {
      e.stopPropagation();
      // close other dropdowns
      document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
      dot.nextElementSibling.style.display = 'block';
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => editWarehouse(btn.dataset.id);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      if(confirm("Delete this warehouse?")) {
        database.ref("warehouses/" + btn.dataset.id).remove();
      }
    };
  });

  // Close dropdown on click outside
  window.onclick = () => {
    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
  };
}

// ===================== EDIT =====================
function editWarehouse(id) {
  database.ref("warehouses/" + id).once("value").then(snapshot => {
    const d = snapshot.val();
    warehouseCode.value = d.warehouseCode;
    warehouseName.value = d.warehouseName;
    locationInput.value = d.location;
    warehouseForm.setAttribute("data-edit-id", id);
    warehouseModal.style.display = "block";
  });
}

// ===================== SAVE =====================
warehouseForm.onsubmit = e => {
  e.preventDefault();

  const data = {
    warehouseCode: warehouseCode.value.trim(),
    warehouseName: warehouseName.value.trim(),
    location: locationInput.value.trim(),
    timestamp: Date.now()
  };

  if (!data.warehouseCode || !data.warehouseName || !data.location) {
    alert("All fields are required!");
    return;
  }

  const editId = warehouseForm.getAttribute("data-edit-id");

  if (editId) {
    database.ref("warehouses/" + editId).update(data);
    warehouseForm.removeAttribute("data-edit-id");
  } else {
    database.ref("warehouses").push(data);
  }

  warehouseForm.reset();
  warehouseModal.style.display = "none";
};

// ===================== INIT =====================
window.addEventListener("DOMContentLoaded", () => {
  loadWarehouses();
  sortSelect.onchange = e => sortWarehouses(e.target.value);

  // Open/Close modal
  document.getElementById('addWarehouse').onclick = () => warehouseModal.style.display = 'block';
  document.getElementById('closeWarehouse').onclick = () => warehouseModal.style.display = 'none';
  window.onclick = e => { if(e.target === warehouseModal) warehouseModal.style.display = 'none'; };
});
