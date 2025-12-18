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

// Global variable to store cereals for sorting
let allCereals = [];
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

const cerealModal = document.getElementById("cerealModal");

/* OPEN ADD CEREAL MODAL */
document.getElementById("addCereal").onclick = () => {
  // Clear form when adding new cereal
  document.getElementById("cerealForm").reset();
  document.getElementById("cerealForm").removeAttribute('data-edit-id');
  cerealModal.style.display = "block";
};

/* PREVIEW BUTTON - Opens new window with print preview */
document.getElementById("previewCereal").onclick = () => {
  window.open("preview.html", "_blank");
};

/* CLOSE MODAL */
document.getElementById("closeCereal").onclick = () => {
  cerealModal.style.display = "none";
};

/* SAVE CEREAL TO FIREBASE */
document.getElementById("cerealForm").onsubmit = e => {
  e.preventDefault();
  
  const form = e.target;
  const editId = form.getAttribute('data-edit-id');
  
  // Collect all cereal data
  const cerealData = {
    cerealCode: document.getElementById("cerealCode").value || "",
    description: document.getElementById("description").value || "",
    computeTAFor: document.getElementById("computeTAFor").value || "",
    timestamp: Date.now()
  };

  // Clear any previous red borders
  document.querySelectorAll('input, select').forEach(field => {
    field.style.border = '';
  });

  // Validation: Check required fields
  const requiredFieldIds = ['cerealCode', 'description', 'computeTAFor'];
  document.querySelectorAll('.field-error-message').forEach(msg => msg.remove());
  
  let hasEmptyFields = false;
  
  requiredFieldIds.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (!cerealData[fieldId]) {
      element.style.border = '2px solid #ff6b6b';
      hasEmptyFields = true;
      
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
  
  if (editId) {
    // UPDATE existing cereal
    cerealData.updatedAt = new Date().toISOString();
    const cerealRef = database.ref('cereals/' + editId);
    
    console.log("Updating cereal:", editId, cerealData);
    
    cerealRef.update(cerealData)
      .then(() => {
        console.log("Cereal updated successfully!");
        alert("Cereal updated successfully!");
        cerealModal.style.display = "none";
        form.reset();
        form.removeAttribute('data-edit-id');
      })
      .catch((error) => {
        console.error("Error updating cereal:", error);
        alert("Error updating cereal: " + error.message);
      });
  } else {
    // CREATE new cereal
    cerealData.createdAt = new Date().toISOString();
    const cerealsRef = database.ref('cereals');
    const newCerealRef = cerealsRef.push();
    
    console.log("Saving cereal:", cerealData);
    
    newCerealRef.set(cerealData)
      .then(() => {
        console.log("Cereal saved successfully!");
        alert("Cereal saved successfully!");
        cerealModal.style.display = "none";
        form.reset();
      })
      .catch((error) => {
        console.error("Error saving cereal:", error);
        alert("Error saving cereal: " + error.message);
      });
  }
};

/* SORT CEREALS */
function sortCereals(order) {
  currentSortOrder = order;
  
  allCereals.sort((a, b) => {
    const dateA = new Date(a.data.createdAt || '1900-01-01');
    const dateB = new Date(b.data.createdAt || '1900-01-01');
    
    if (order === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  renderCereals();
}

/* Helper function to close all dropdowns */
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
}

/* RENDER CEREALS TO TABLE */
function renderCereals() {
  const tbody = document.getElementById("cerealBody");
  tbody.innerHTML = "";
  
  if (allCereals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">No cereals found</td>
      </tr>`;
    return;
  }
  
  allCereals.forEach(item => {
    const data = item.data;
    const docId = item.docId;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.cerealCode || "-"}</td>
      <td>${data.description || "-"}</td>
      <td>${data.computeTAFor || "-"}</td>
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
  
  attachDropdownListeners();
}

function attachDropdownListeners() {
  document.querySelectorAll('.dot-menu').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      
      document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d !== dot.nextElementSibling) d.style.display = 'none';
      });
      
      const dropdown = dot.nextElementSibling;
      
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
      closeAllDropdowns();
      editCereal(docId);
    });
  });

  // Delete button handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      closeAllDropdowns();
      
      if (confirm("Are you sure you want to delete this cereal?")) {
        deleteCereal(docId);
      }
    });
  });
}

/* Close dropdowns when clicking outside */
window.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
});

/* Close dropdowns when scrolling */
window.addEventListener('scroll', () => {
  closeAllDropdowns();
}, true);

/* LOAD CEREALS FROM FIREBASE */
function loadCereals() {
  const tbody = document.getElementById("cerealBody");
  
  if (!tbody) {
    console.error("cerealBody element not found");
    return;
  }
  
  const cerealsRef = database.ref("cereals");

  console.log("Loading cereals from Firebase...");
  console.log("Database reference:", cerealsRef.toString());

  cerealsRef.on("value", (snapshot) => {
    console.log("Firebase snapshot received");
    console.log("Snapshot exists:", snapshot.exists());
    console.log("Snapshot value:", snapshot.val());
    
    allCereals = [];

    if (!snapshot.exists()) {
      console.log("No cereals found in database");
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">No cereals found</td>
        </tr>`;
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const docId = childSnapshot.key;
      
      console.log("Cereal found:", docId, data);
      
      allCereals.push({
        docId: docId,
        data: data
      });
    });
    
    console.log(`Loaded ${allCereals.length} cereals`);
    
    sortCereals(currentSortOrder);
  }, (error) => {
    console.error("Error loading cereals:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color: red;">Error loading cereals: ${error.message}</td>
      </tr>`;
  });
}

/* DELETE CEREAL */
function deleteCereal(docId) {
  const cerealRef = database.ref('cereals/' + docId);
  
  cerealRef.remove()
    .then(() => {
      console.log('Cereal deleted successfully');
      alert('Cereal deleted successfully!');
    })
    .catch((error) => {
      console.error('Error deleting cereal:', error);
      alert('Error deleting cereal: ' + error.message);
    });
}

/* EDIT CEREAL */
function editCereal(docId) {
  const cerealRef = database.ref('cereals/' + docId);
  
  cerealRef.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        alert('Cereal not found!');
        return;
      }
      
      const data = snapshot.val();
      
      document.getElementById("cerealCode").value = data.cerealCode || "";
      document.getElementById("description").value = data.description || "";
      document.getElementById("computeTAFor").value = data.computeTAFor || "";
      
      document.getElementById("cerealForm").setAttribute('data-edit-id', docId);
      
      cerealModal.style.display = "block";
      
    })
    .catch((error) => {
      console.error('Error loading cereal:', error);
      alert('Error loading cereal: ' + error.message);
    });
}

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  console.log("Cereal Library page loaded");
  loadCereals();
  
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortCereals(e.target.value);
    });
  }
});