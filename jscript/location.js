// ===================== FIREBASE CONFIGURATION =====================
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ===================== GLOBAL VARIABLES =====================
let allLocations = [];
let currentSortOrder = 'newest';

// ===================== LOAD SIDEBAR =====================
fetch("sidebar.html")
  .then(r => r.text())
  .then(html => { document.getElementById("sidebar").innerHTML = html; })
  .catch(err => console.error("Error loading sidebar:", err));

// ===================== MODAL ELEMENTS =====================
const locationModal = document.getElementById("locationModal");
const addLocationBtn = document.getElementById("addLocation");
const closeLocationBtn = document.getElementById("closeLocation");

// ===================== OPEN/CLOSE MODAL =====================
addLocationBtn.onclick = () => {
  document.getElementById("locationForm").reset();
  document.getElementById("locationForm").removeAttribute('data-edit-id');
  locationModal.style.display = 'block';
};

closeLocationBtn.onclick = () => { locationModal.style.display = 'none'; };
window.onclick = e => { if (e.target === locationModal) locationModal.style.display = 'none'; };

// ===================== PREVIEW BUTTON =====================
document.getElementById("previewLocation").onclick = () => {
  window.open("preview.html", "_blank");
};

// ===================== LOAD LOCATIONS FROM FIREBASE =====================
function loadLocations() {
  const tbody = document.getElementById("locationBody");
  database.ref("locations").on("value", snapshot => {
    allLocations = [];

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No locations found</td></tr>`;
      return;
    }

    snapshot.forEach(child => {
      allLocations.push({ id: child.key, data: child.val() });
    });

    sortLocations(currentSortOrder);
  });
}

// ===================== SORT LOCATIONS =====================
function sortLocations(order) {
  currentSortOrder = order;
  allLocations.sort((a, b) => order === 'newest' 
    ? b.data.timestamp - a.data.timestamp 
    : a.data.timestamp - b.data.timestamp);
  renderLocations();
}

// ===================== RENDER LOCATIONS =====================
function renderLocations() {
  const tbody = document.getElementById("locationBody");
  tbody.innerHTML = "";

  if (allLocations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No locations found</td></tr>`;
    return;
  }

  allLocations.forEach(item => {
    const d = item.data;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.locationCode || '-'}</td>
      <td>${d.provinceName || '-'}</td>
      <td>${d.abbreviation || '-'}</td>
      <td class="action-cell">
        <div class="dropdown">
          <span class="dot-menu">&#8942;</span>
          <div class="dropdown-content">
            <button class="edit-btn" data-id="${item.id}">Edit</button>
            <button class="delete-btn" data-id="${item.id}">Delete</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachDropdownListeners();
}

// ===================== DROPDOWN HANDLERS =====================
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
}

function attachDropdownListeners() {
  document.querySelectorAll('.dot-menu').forEach(dot => {
    dot.onclick = e => {
      e.stopPropagation();
      closeAllDropdowns();
      const dropdown = dot.nextElementSibling;
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      editLocation(btn.dataset.id);
      closeAllDropdowns();
    };
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      if (confirm("Delete this location?")) {
        database.ref('locations/' + btn.dataset.id).remove()
          .then(() => alert("Location deleted!"))
          .catch(err => alert("Error deleting location: " + err.message));
      }
      closeAllDropdowns();
    };
  });
}

// ===================== EDIT LOCATION =====================
function editLocation(id) {
  database.ref('locations/' + id).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      document.getElementById("locationCode").value = data.locationCode || "";
      document.getElementById("provinceName").value = data.provinceName || "";
      document.getElementById("abbreviation").value = data.abbreviation || "";
      document.getElementById("locationForm").setAttribute('data-edit-id', id);
      locationModal.style.display = 'block';
    });
}

// ===================== SAVE LOCATION =====================
document.getElementById("locationForm").onsubmit = e => {
  e.preventDefault();
  const form = e.target;
  const editId = form.getAttribute('data-edit-id');

  const locationData = {
    locationCode: document.getElementById("locationCode").value.trim(),
    provinceName: document.getElementById("provinceName").value.trim(),
    abbreviation: document.getElementById("abbreviation").value.trim(),
    timestamp: Date.now()
  };

  if (!locationData.locationCode || !locationData.provinceName || !locationData.abbreviation) {
    alert("All fields are required");
    return;
  }

  if (editId) {
    database.ref('locations/' + editId).update(locationData)
      .then(() => {
        alert("Location updated!");
        form.reset();
        form.removeAttribute('data-edit-id');
        locationModal.style.display = 'none';
      })
      .catch(err => alert("Error updating location: " + err.message));
  } else {
    database.ref('locations').push(locationData)
      .then(() => {
        alert("Location added!");
        form.reset();
        locationModal.style.display = 'none';
      })
      .catch(err => alert("Error adding location: " + err.message));
  }
};

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', () => {
  loadLocations();
  document.getElementById('sortSelect').addEventListener('change', e => sortLocations(e.target.value));
  window.addEventListener('click', closeAllDropdowns);
});
