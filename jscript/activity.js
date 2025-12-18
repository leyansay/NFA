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

// Global variable to store activities for sorting
let allActivities = [];
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

const activityModal = document.getElementById("activityModal");

/* OPEN ADD ACTIVITY MODAL */
document.getElementById("addActivity").onclick = () => {
  // Clear form when adding new activity
  document.getElementById("activityForm").reset();
  document.getElementById("activityForm").removeAttribute('data-edit-id');
  activityModal.style.display = "block";
};

/* PREVIEW BUTTON - Opens new window with print preview */
document.getElementById("previewTransaction").onclick = () => {
  window.open("preview.html", "_blank");
};

/* CLOSE MODAL */
document.getElementById("closeActivity").onclick = () => {
  activityModal.style.display = "none";
};

/* SAVE ACTIVITY TO FIREBASE */
document.getElementById("activityForm").onsubmit = e => {
  e.preventDefault();
  
  const form = e.target;
  const editId = form.getAttribute('data-edit-id');
  
  // Collect all activity data
  const activityData = {
    activityCode: document.getElementById("activityCode").value || "",
    description: document.getElementById("descrip").value || "",
    abbreviation: document.getElementById("abbreviation").value || "",
    includeTA: document.getElementById("includeTA").value || "",
    inWhse: document.getElementById("inWhse").value || "",
    transactionDate: document.getElementById("transactionDate").value || "",
    timestamp: Date.now()
  };

  // Clear any previous red borders
  document.querySelectorAll('input, select').forEach(field => {
    field.style.border = '';
  });

  // Validation: Check required fields
  const requiredFieldIds = ['activityCode', 'descrip'];
  document.querySelectorAll('.field-error-message').forEach(msg => msg.remove());
  
  let hasEmptyFields = false;
  
  requiredFieldIds.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (!activityData[fieldId === 'descrip' ? 'description' : fieldId]) {
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
    // UPDATE existing activity
    activityData.updatedAt = new Date().toISOString();
    const activityRef = database.ref('activities/' + editId);
    
    console.log("Updating activity:", editId, activityData);
    
    activityRef.update(activityData)
      .then(() => {
        console.log("Activity updated successfully!");
        alert("Activity updated successfully!");
        activityModal.style.display = "none";
        form.reset();
        form.removeAttribute('data-edit-id');
      })
      .catch((error) => {
        console.error("Error updating activity:", error);
        alert("Error updating activity: " + error.message);
      });
  } else {
    // CREATE new activity
    activityData.createdAt = new Date().toISOString();
    const activitiesRef = database.ref('activities');
    const newActivityRef = activitiesRef.push();
    
    console.log("Saving activity:", activityData);
    
    newActivityRef.set(activityData)
      .then(() => {
        console.log("Activity saved successfully!");
        alert("Activity saved successfully!");
        activityModal.style.display = "none";
        form.reset();
      })
      .catch((error) => {
        console.error("Error saving activity:", error);
        alert("Error saving activity: " + error.message);
      });
  }
};

/* SORT ACTIVITIES */
function sortActivities(order) {
  currentSortOrder = order;
  
  allActivities.sort((a, b) => {
    const dateA = new Date(a.data.transactionDate || a.data.createdAt || '1900-01-01');
    const dateB = new Date(b.data.transactionDate || b.data.createdAt || '1900-01-01');
    
    if (order === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  renderActivities();
}

/* Helper function to close all dropdowns */
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
}

/* RENDER ACTIVITIES TO TABLE */
function renderActivities() {
  const tbody = document.getElementById("inventoryBody");
  tbody.innerHTML = "";
  
  if (allActivities.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">No activities found</td>
      </tr>`;
    return;
  }
  
  allActivities.forEach(item => {
    const data = item.data;
    const docId = item.docId;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.activityCode || "-"}</td>
      <td>${data.description || "-"}</td>
      <td>${data.abbreviation || "-"}</td>
      <td>${data.includeTA || "-"}</td>
      <td>${data.inWhse || "-"}</td>
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
      editActivity(docId);
    });
  });

  // Delete button handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.dataset.docId;
      closeAllDropdowns();
      
      if (confirm("Are you sure you want to delete this activity?")) {
        deleteActivity(docId);
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

/* LOAD ACTIVITIES FROM FIREBASE */
function loadActivities() {
  const tbody = document.getElementById("inventoryBody");
  
  if (!tbody) {
    console.error("inventoryBody element not found");
    return;
  }
  
  const activitiesRef = database.ref("activities");

  console.log("Loading activities from Firebase...");
  console.log("Database reference:", activitiesRef.toString());

  activitiesRef.on("value", (snapshot) => {
    console.log("Firebase snapshot received");
    console.log("Snapshot exists:", snapshot.exists());
    console.log("Snapshot value:", snapshot.val());
    
    allActivities = [];

    if (!snapshot.exists()) {
      console.log("No activities found in database");
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;">No activities found</td>
        </tr>`;
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const docId = childSnapshot.key;
      
      console.log("Activity found:", docId, data);
      
      allActivities.push({
        docId: docId,
        data: data
      });
    });
    
    console.log(`Loaded ${allActivities.length} activities`);
    
    sortActivities(currentSortOrder);
  }, (error) => {
    console.error("Error loading activities:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color: red;">Error loading activities: ${error.message}</td>
      </tr>`;
  });
}

/* DELETE ACTIVITY */
function deleteActivity(docId) {
  const activityRef = database.ref('activities/' + docId);
  
  activityRef.remove()
    .then(() => {
      console.log('Activity deleted successfully');
      alert('Activity deleted successfully!');
    })
    .catch((error) => {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity: ' + error.message);
    });
}

/* EDIT ACTIVITY */
function editActivity(docId) {
  const activityRef = database.ref('activities/' + docId);
  
  activityRef.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        alert('Activity not found!');
        return;
      }
      
      const data = snapshot.val();
      
      document.getElementById("activityCode").value = data.activityCode || "";
      document.getElementById("descrip").value = data.description || "";
      document.getElementById("abbreviation").value = data.abbreviation || "";
      document.getElementById("includeTA").value = data.includeTA || "";
      document.getElementById("inWhse").value = data.inWhse || "";
      document.getElementById("transactionDate").value = data.transactionDate || "";
      
      document.getElementById("activityForm").setAttribute('data-edit-id', docId);
      
      activityModal.style.display = "block";
      
    })
    .catch((error) => {
      console.error('Error loading activity:', error);
      alert('Error loading activity: ' + error.message);
    });
}

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  console.log("Activity Library page loaded");
  loadActivities();
  
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortActivities(e.target.value);
    });
  }
});