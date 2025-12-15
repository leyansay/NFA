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

// Load sidebar
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("goHome").addEventListener("click", () => {
      window.location.href = "homepage.html";
    });
    document.getElementById("goTrans").addEventListener("click", () => {
      window.location.href = "transaction.html";
    });
    document.getElementById("goAcc").addEventListener("click", () => {
      window.location.href = "accountable.html";
    });
    document.getElementById("goInv").addEventListener("click", () => {
      window.location.href = "inventory.html";
    });
  })
  .catch(error => {
    console.error("Error loading sidebar:", error);
  });

// Store current officer ID for masterfile editing
let currentOfficerDocId = null;

// Initialize modal functionality after DOM loads
function initializeModals() {
  // ----- ACCOUNTABLE OFFICER MODAL -----
  const accountableModal = document.getElementById("accountableModal");
  const openAccountableBtn = document.getElementById("openModal");
  const closeAccountableBtn = document.getElementById("closeAccountable");

  if (openAccountableBtn) {
    openAccountableBtn.addEventListener("click", () => {
      accountableModal.style.display = "block";
    });
  }

  if (closeAccountableBtn) {
    closeAccountableBtn.addEventListener("click", () => {
      accountableModal.style.display = "none";
    });
  }

  // ----- MASTERFILE MODAL -----
  document.getElementById('closeMasterfile')?.addEventListener('click', () => {
    document.getElementById('masterfileModal').style.display = 'none';
    currentOfficerDocId = null;
  });

  document.getElementById('cancelBtn')?.addEventListener('click', () => {
    document.getElementById('masterfileModal').style.display = 'none';
    currentOfficerDocId = null;
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === accountableModal) accountableModal.style.display = "none";
    const masterfileModal = document.getElementById('masterfileModal');
    if (e.target === masterfileModal) {
      masterfileModal.style.display = "none";
      currentOfficerDocId = null;
    }
  });
}

// ----- REALTIME DATABASE: Load Officers -----
function loadOfficersFromFirebase() {
  console.log("Loading officers from Firebase...");
  const officersRef = database.ref('accountableOfficers');
  
  officersRef.once('value')
    .then((snapshot) => {
      console.log("Data received:", snapshot.exists());
      const tbody = document.querySelector(".inventory-table tbody");
      tbody.innerHTML = ""; // Clear table

      if (!snapshot.exists()) {
        console.log("No data in database");
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="8" style="text-align: center;">No officers added yet</td>';
        tbody.appendChild(tr);
        return;
      }

      snapshot.forEach((childSnapshot) => {
        const docId = childSnapshot.key;
        const data = childSnapshot.val();
        console.log("Officer:", docId, data);
        addRowToTable(docId, data);
      });

      // Reattach dropdown listeners after loading
      attachDropdownListeners();
    })
    .catch((error) => {
      console.error("Error loading officers:", error);
      alert("Error loading data: " + error.message);
    });
}

// ----- Add row to table -----
function addRowToTable(docId, data) {
  const tbody = document.querySelector(".inventory-table tbody");
  const tr = document.createElement("tr");
  tr.dataset.docId = docId;

  // Format period display
  let periodDisplay = "-";
  if (data.fromDate && data.toDate) {
    periodDisplay = `${data.fromDate} to ${data.toDate}`;
  }

  tr.innerHTML = `
    <td>${data.officerId || "-"}</td>
    <td>${data.lastName || "-"}</td>
    <td>${data.firstName || "-"}</td>
    <td>${data.middleName || "-"}</td>
    <td>${data.warehouse || "-"}</td>
    <td>${data.warehouseName || "-"}</td>
    <td>${periodDisplay}</td>
    <td class="action-cell">
      <div class="dropdown">
        <span class="dot-menu">&#8942;</span>
        <div class="dropdown-content">
          <button class="masterfile-btn" data-doc-id="${docId}">Add/Edit Masterfile</button>
          <button class="delete-btn" data-doc-id="${docId}">Delete</button>
        </div>
      </div>
    </td>
  `;

  tbody.appendChild(tr);
}

// ----- Handle Accountable Officer form submission -----
document.getElementById("accountableForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Form submitted");

  const formData = {
    officerId: document.getElementById("officerId").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    middleName: document.getElementById("middleName").value,
    warehouse: "",
    warehouseName: "",
    fromDate: "",
    toDate: "",
    statusExam: "",
    note: "",
    createdAt: new Date().toISOString()
  };

  console.log("Saving accountable officer data:", formData);

  // Save to Realtime Database
  const newOfficerRef = database.ref('accountableOfficers').push();
  
  newOfficerRef.set(formData)
    .then(() => {
      console.log("Officer added successfully to Firebase!");
      alert("Officer added successfully! Now add their warehouse details in the Masterfile.");
      const accountableModal = document.getElementById("accountableModal");
      accountableModal.style.display = "none";
      e.target.reset();
      loadOfficersFromFirebase(); // Reload table
    })
    .catch((error) => {
      console.error("Error adding officer:", error);
      alert("Failed to add officer: " + error.message);
    });
});

// ----- Handle Masterfile form submission -----
document.getElementById("masterfileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Masterfile form submitted");

  if (!currentOfficerDocId) {
    alert("No officer selected. Please try again.");
    return;
  }

  // FIXED: Get the correct field IDs from your HTML
  const warehouseCode = document.getElementById("warehouse").value;
  const warehouseName = document.getElementById("warehouse_name").value; // FIXED: underscore not camelCase
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const statusExam = document.getElementById("statusExam").value;
  const note = document.getElementById("note").value;

  const masterfileData = {
    warehouse: warehouseCode,
    warehouseName: warehouseName, // FIXED: Now properly gets the warehouse name
    fromDate: fromDate,
    toDate: toDate,
    statusExam: statusExam,
    note: note,
    updatedAt: new Date().toISOString()
  };

  console.log("Saving masterfile data:", masterfileData);
  console.log("Warehouse Name value:", warehouseName);

  // Update the officer record with masterfile data
  database.ref('accountableOfficers/' + currentOfficerDocId).update(masterfileData)
    .then(() => {
      console.log("Masterfile data saved successfully!");
      alert("Masterfile data saved successfully!");
      const masterfileModal = document.getElementById('masterfileModal');
      masterfileModal.style.display = "none";
      e.target.reset();
      currentOfficerDocId = null;
      loadOfficersFromFirebase(); // Reload table
    })
    .catch((error) => {
      console.error("Error saving masterfile:", error);
      alert("Failed to save masterfile: " + error.message);
    });
});

// ----- Handle dot-menu dropdowns -----
function attachDropdownListeners() {
  document.querySelectorAll('.dot-menu').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d !== dot.nextElementSibling) d.style.display = 'none';
      });
      const dropdown = dot.nextElementSibling;
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Masterfile button handler
  document.querySelectorAll('.masterfile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      currentOfficerDocId = docId;
      
      console.log("Opening masterfile for officer:", docId);
      
      // Load existing data if available
      database.ref('accountableOfficers/' + docId).once('value')
        .then((snapshot) => {
          const data = snapshot.val();
          console.log("Officer data loaded:", data);
          
          if (data) {
            // Pre-fill the Officer ID
            const officerMasterField = document.getElementById("officerMaster");
            if (officerMasterField) {
              officerMasterField.value = data.officerId || "";
              officerMasterField.setAttribute("readonly", true);
            }
            
            // Pre-fill the Officer Name (Full Name: Last, First Middle)
            const officerNameField = document.getElementById("officerName");
            if (officerNameField) {
              const lastName = data.lastName || "";
              const firstName = data.firstName || "";
              const middleName = data.middleName || "";
              const fullName = `${lastName}, ${firstName} ${middleName}`.trim();
              officerNameField.value = fullName;
              officerNameField.setAttribute("readonly", true);
            }
            
            // Pre-fill warehouse code
            document.getElementById("warehouse").value = data.warehouse || "";
            
            // FIXED: Pre-fill warehouse name using correct ID (warehouse_name with underscore)
            const warehouseNameField = document.getElementById("warehouse_name");
            if (warehouseNameField) {
              warehouseNameField.value = data.warehouseName || "";
              console.log("Pre-filled warehouse name:", data.warehouseName);
            }
            
            // Pre-fill dates
            document.getElementById("fromDate").value = data.fromDate || "";
            document.getElementById("toDate").value = data.toDate || "";
            
            // Pre-fill status
            document.getElementById("statusExam").value = data.statusExam || "";
            
            // Pre-fill note
            const noteInput = document.getElementById("note");
            if (noteInput) {
              noteInput.value = data.note || "";
            }
          }
          
          const masterfileModal = document.getElementById('masterfileModal');
          masterfileModal.style.display = "block";
        })
        .catch((error) => {
          console.error("Error loading officer data:", error);
          const masterfileModal = document.getElementById('masterfileModal');
          masterfileModal.style.display = "block";
        });
    });
  });

  // Delete button handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      if (confirm("Are you sure you want to delete this officer?")) {
        database.ref('accountableOfficers/' + docId).remove()
          .then(() => {
            console.log("Officer deleted");
            alert("Officer deleted successfully!");
            loadOfficersFromFirebase();
          })
          .catch((error) => {
            console.error("Error deleting officer:", error);
            alert("Failed to delete: " + error.message);
          });
      }
    });
  });
}

// Initial attachment for existing rows
attachDropdownListeners();

// Close dropdowns when clicking outside
window.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
});

// Load officers when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded, initializing...");
  
  // Initialize modals
  initializeModals();
  
  // Load officers from Firebase
  loadOfficersFromFirebase();
});