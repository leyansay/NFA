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

// Global variable to store transactions for sorting
let allTransactions = [];
let currentSortOrder = 'newest'; // default sort order

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

/* PREVIEW BUTTON - Opens new window with print preview */
document.getElementById("previewTransaction").onclick = () => {
  window.open("preview.html", "_blank");
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
  
  // Check if we're editing (has data-edit-id attribute)
  const editId = form.getAttribute('data-edit-id');
  
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
    documentNo: document.getElementById("documentNo").value || "",
    documentType: document.getElementById("documentType").value || "",
    orNo: document.getElementById("orNo").value || "",
    aiNo: document.getElementById("aiNo").value || "",
    refWSINo: document.getElementById("refWSINo").value || "",
    recdFromIssdTo: document.getElementById("recdFromIssdTo").value || "",
    transactionDate: document.getElementById("transactionDate").value || "",
    activityCode: document.getElementById("activityCode").value || "",
    varietyCode: document.getElementById("varietyCode").value || "",
    sackCode: document.getElementById("sackCode").value || "",
    sackCondition: document.getElementById("sackCondition").value || "",
    sackWeight: document.getElementById("sackWeight").value || "",
    age: document.getElementById("age").value || "",
    pileNo: document.getElementById("pileNo").value || "",
    numberOfBags: document.getElementById("numberOfBags").value || "",
    grossWeight: document.getElementById("grossWeight").value || "",
    moistureContent: document.getElementById("moistureContent").value || "",
    netWeight: document.getElementById("netWeight").value || "",
    cancelled: document.getElementById("cancelled").checked,
    
    // Metadata
    timestamp: Date.now()
  };

  // Clear any previous red borders first
document.querySelectorAll('input, select').forEach(field => {
    field.style.border = '';
});

// Validation: If refWSINo is empty, all other transaction fields are required
if (!transactionData.refWSINo) {
    const requiredFieldIds = [
        'documentNo', 'documentType', 'orNo', 'aiNo', 'recdFromIssdTo',
        'transactionDate', 'activityCode', 'varietyCode', 'sackCode',
        'sackCondition', 'sackWeight', 'age', 'pileNo', 'numberOfBags',
        'grossWeight', 'moistureContent', 'netWeight'
    ];
    
    // Remove existing error messages
    document.querySelectorAll('.field-error-message').forEach(msg => msg.remove());
    
    let hasEmptyFields = false;
    
    requiredFieldIds.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (!transactionData[fieldId]) {
            element.style.border = '2px solid #ff6b6b';
            hasEmptyFields = true;
            
            // Add error message below the field
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error-message';
            errorMsg.style.cssText = `
                color: #ff6b6b;
                font-size: 12px;
                margin-top: 4px;
            `;
            errorMsg.textContent = 'This field is required';
            element.parentElement.appendChild(errorMsg);
        }
    });
    
    if (hasEmptyFields) {
        const firstEmptyField = document.querySelector('[style*="border: 2px solid"]');
        if (firstEmptyField) {
            firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstEmptyField.focus();
        }
        return;
    }
}

  
  if (editId) {
    // UPDATE existing transaction
    transactionData.updatedAt = new Date().toISOString();
    const transactionRef = database.ref('transactions/' + editId);
    
    console.log("Updating transaction:", editId, transactionData);
    
    transactionRef.update(transactionData)
      .then(() => {
        console.log("Transaction updated successfully!");
        alert("Transaction updated successfully!");
        transactionModal.style.display = "none";
        form.reset();
        form.removeAttribute('data-edit-id');
        
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
        console.error("Error updating transaction:", error);
        alert("Error updating transaction: " + error.message);
      });
  } else {
    // CREATE new transaction
    transactionData.createdAt = new Date().toISOString();
    const transactionsRef = database.ref('transactions');
    const newTransactionRef = transactionsRef.push();
    
    console.log("Saving transaction:", transactionData);
    
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
  }
};

/* NET WEIGHT COMPUTATION */
const gross = document.getElementById("grossWeight");
const sack = document.getElementById("sackWeight");
const bags = document.getElementById("numberOfBags");
const net = document.getElementById("netWeight");

function computeNetWeight() {
  const g = parseFloat(gross.value) || 0;
  const s = parseFloat(sack.value) || 0;
  const b = parseFloat(bags.value) || 0;
  
  // Sack weight × Number of bags, then subtract from gross weight
  const totalSackWeight = s * b;
  net.value = (g - totalSackWeight).toFixed(2);
}

gross.addEventListener("input", computeNetWeight);
sack.addEventListener("input", computeNetWeight);
bags.addEventListener("input", computeNetWeight);

/* SORT TRANSACTIONS */
function sortTransactions(order) {
  currentSortOrder = order;
  
  // Sort the array
  allTransactions.sort((a, b) => {
    const dateA = new Date(a.data.transactionDate || '1900-01-01');
    const dateB = new Date(b.data.transactionDate || '1900-01-01');
    
    if (order === 'newest') {
      return dateB - dateA; // Newest first
    } else {
      return dateA - dateB; // Oldest first
    }
  });
  
  // Re-render the table
  renderTransactions();
}

/* Helper function to close all dropdowns */
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
}

/* RENDER TRANSACTIONS TO TABLE */
function renderTransactions() {
  const tbody = document.getElementById("inventoryBody");
  tbody.innerHTML = "";
  
  if (allTransactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="26" style="text-align:center;">No transactions found</td>
      </tr>`;
    return;
  }
  
  allTransactions.forEach(item => {
    const data = item.data;
    const docId = item.docId;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.officerId || "-"}</td>
      <td>${data.officerName || "-"}</td>
      <td>${data.warehouseId || "-"}</td>
      <td>${data.warehouseName || "-"}</td>
      <td>${data.periodFrom || "-"}</td>
      <td>${data.periodTo || "-"}</td>

      <td>${data.documentNo || "-"}</td>
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
      <td>${data.sackWeight || "-"}</td>

      <td>${data.age || "-"}</td>
      <td>${data.pileNo || "-"}</td>
      <td>${data.numberOfBags || "-"}</td>

      <td>${data.grossWeight || "-"}</td>
      <td>${data.moistureContent || "-"}</td>
      <td>${data.netWeight || "-"}</td>

      <td>${data.cancelled ? "Yes" : "No"}</td>
      
      <td class="action-cell">
        <div class="dropdown">
          <span class="dot-menu">&#8942;</span>
          <div class="dropdown-content">
            <button class="edit-btn" data-doc-id="${docId}">✏️ Edit</button>
            <button class="delete-btn" data-doc-id="${docId}">🗑️ Delete</button>
          </div>
        </div>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Attach event listeners to action buttons
  attachDropdownListeners();
}


function attachDropdownListeners() {
  document.querySelectorAll('.dot-menu').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close all other dropdowns
      document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d !== dot.nextElementSibling) d.style.display = 'none';
      });
      
      const dropdown = dot.nextElementSibling;
      
      // Toggle dropdown
      if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
      } else {
        dropdown.style.display = 'block';
      }
    });
  });

  // Edit button handler
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      
      // Close dropdown before opening modal
      closeAllDropdowns();
      
      editTransaction(docId);
    });
  });

  // Delete button handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      
      // Close dropdown before showing confirm dialog
      closeAllDropdowns();
      
      if (confirm("Are you sure you want to delete this transaction?")) {
        deleteTransaction(docId);
      }
    });
  });
}

/* Close dropdowns when clicking outside */
window.addEventListener('click', (e) => {
  // Don't close if clicking inside a dropdown
  if (!e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
});

/* Close dropdowns when scrolling */
window.addEventListener('scroll', () => {
  closeAllDropdowns();
}, true);

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
    allTransactions = []; // Clear the array

    if (!snapshot.exists()) {
      renderTransactions();
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
    
    // Sort and render
    sortTransactions(currentSortOrder);
  }, (error) => {
    console.error("Error loading transactions:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="26" style="text-align:center; color: red;">Error loading transactions: ${error.message}</td>
      </tr>`;
  });
}

/* DELETE TRANSACTION */
function deleteTransaction(docId) {
  const transactionRef = database.ref('transactions/' + docId);
  
  transactionRef.remove()
    .then(() => {
      console.log('Transaction deleted successfully');
      alert('Transaction deleted successfully!');
    })
    .catch((error) => {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction: ' + error.message);
    });
}

/* EDIT TRANSACTION */
function editTransaction(docId) {
  const transactionRef = database.ref('transactions/' + docId);
  
  transactionRef.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        alert('Transaction not found!');
        return;
      }
      
      const data = snapshot.val();
      
      // Populate the form with existing data
      document.getElementById("officerId").value = data.officerId || "";
      document.getElementById("officerName").value = data.officerName || "";
      document.getElementById("warehouseId").value = data.warehouseId || "";
      document.getElementById("warehouseName").value = data.warehouseName || "";
      document.getElementById("periodFrom").value = data.periodFrom || "";
      document.getElementById("periodTo").value = data.periodTo || "";
      
      document.getElementById("documentNo").value = data.documentNo || "";
      document.getElementById("documentType").value = data.documentType || "";
      document.getElementById("orNo").value = data.orNo || "";
      document.getElementById("aiNo").value = data.aiNo || "";
      document.getElementById("refWSINo").value = data.refWSINo || "";
      document.getElementById("recdFromIssdTo").value = data.recdFromIssdTo || "";
      document.getElementById("transactionDate").value = data.transactionDate || "";
      document.getElementById("activityCode").value = data.activityCode || "";
      document.getElementById("varietyCode").value = data.varietyCode || "";
      document.getElementById("sackCode").value = data.sackCode || "";
      document.getElementById("sackCondition").value = data.sackCondition || "";
      document.getElementById("sackWeight").value = data.sackWeight || "";
      document.getElementById("age").value = data.age || "";
      document.getElementById("pileNo").value = data.pileNo || "";
      document.getElementById("numberOfBags").value = data.numberOfBags || "";
      document.getElementById("grossWeight").value = data.grossWeight || "";
      document.getElementById("moistureContent").value = data.moistureContent || "";
      document.getElementById("netWeight").value = data.netWeight || "";
      document.getElementById("cancelled").checked = data.cancelled || false;
      
      // Store the docId for updating
      document.getElementById("transactionForm").setAttribute('data-edit-id', docId);
      
      // Open the modal
      transactionModal.style.display = "block";
      
    })
    .catch((error) => {
      console.error('Error loading transaction:', error);
      alert('Error loading transaction: ' + error.message);
    });
}

attachDropdownListeners();

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  console.log("Transaction page loaded");
  loadTransactions();
  
  // Attach sort dropdown listener
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortTransactions(e.target.value);
    });
  }
});