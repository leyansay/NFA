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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ===================== GLOBAL VARIABLES =====================
let allVarieties = [];
let currentSortOrder = 'newest';

// ===================== LOAD SIDEBAR =====================
fetch("sidebar.html")
  .then(r => r.text())
  .then(html => { document.getElementById("sidebar").innerHTML = html; })
  .catch(err => console.error("Error loading sidebar:", err));

// ===================== LOAD VARIETIES FROM FIREBASE =====================
function loadVarieties() {
  const tbody = document.getElementById("sackBody");
  database.ref("varieties").on("value", snapshot => {
    allVarieties = [];
    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No varieties found</td></tr>`;
      return;
    }

    snapshot.forEach(child => {
      allVarieties.push({ id: child.key, data: child.val() });
    });

    sortVarieties(currentSortOrder);
  });
}

// ===================== SORT VARIETIES =====================
function sortVarieties(order) {
  currentSortOrder = order;
  allVarieties.sort((a,b) => order==='newest'? b.data.timestamp - a.data.timestamp : a.data.timestamp - b.data.timestamp);
  renderVarieties();
}

// ===================== RENDER VARIETIES =====================
function renderVarieties() {
  const tbody = document.getElementById("sackBody");
  tbody.innerHTML = "";

  if (allVarieties.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No varieties found</td></tr>`;
    return;
  }

  allVarieties.forEach(item => {
    const d = item.data;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.varietyCode || '-'}</td>
      <td>${d.description || '-'}</td>
      <td>${d.cerealType || '-'}</td>
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
      dropdown.style.display = dropdown.style.display === 'block'? 'none':'block';
    };
  });

  // Edit button
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      editVariety(btn.dataset.id);
      closeAllDropdowns();
    };
  });

  // Delete button
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      if(confirm("Delete this variety?")) {
        database.ref('varieties/'+btn.dataset.id).remove()
          .then(()=> alert("Variety deleted!"))
          .catch(err=> alert("Error deleting variety: "+err.message));
      }
      closeAllDropdowns();
    };
  });
}

// ===================== EDIT VARIETY =====================
function editVariety(id) {
  database.ref('varieties/'+id).once('value')
    .then(snapshot=>{
      const data = snapshot.val();
      document.getElementById("varietyCode").value = data.varietyCode || "";
      document.getElementById("description").value = data.description || "";
      document.getElementById("cerealType").value = data.cerealType || "";
      document.getElementById("sackForm").setAttribute('data-edit-id', id);
      document.getElementById("sackModal").style.display = 'block';
    });
}

// ===================== SAVE VARIETY =====================
document.getElementById("sackForm").onsubmit = e => {
  e.preventDefault();
  const form = e.target;
  const editId = form.getAttribute('data-edit-id');

  const varietyCode = document.getElementById("varietyCode").value.trim();
  const description = document.getElementById("description").value.trim();
  const cerealType = document.getElementById("cerealType").value.trim();

  // Clear any previous red borders
  document.querySelectorAll('input').forEach(field => {
    field.style.border = '';
  });

  // Validation
  document.querySelectorAll('.field-error-message').forEach(msg => msg.remove());
  
  let hasEmptyFields = false;
  const requiredFields = [
    { id: 'varietyCode', value: varietyCode, label: 'Variety Code' },
    { id: 'description', value: description, label: 'Description' },
    { id: 'cerealType', value: cerealType, label: 'Cereal Type' }
  ];

  requiredFields.forEach(field => {
    if (!field.value) {
      const element = document.getElementById(field.id);
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

  const varietyData = { 
    varietyCode, 
    description, 
    cerealType, 
    timestamp: Date.now() 
  };

  if(editId){
    database.ref('varieties/'+editId).update(varietyData)
      .then(()=> {
        alert("Variety updated!");
        form.reset();
        form.removeAttribute('data-edit-id');
        document.getElementById("sackModal").style.display = 'none';
      })
      .catch(err => alert("Error updating variety: "+err.message));
  } else {
    database.ref('varieties').push(varietyData)
      .then(()=> {
        alert("Variety added!");
        form.reset();
        document.getElementById("sackModal").style.display = 'none';
      })
      .catch(err => alert("Error adding variety: "+err.message));
  }
};

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', ()=>{
  loadVarieties();
  document.getElementById('sortSelect').addEventListener('change', e=> sortVarieties(e.target.value));
  window.addEventListener('click', closeAllDropdowns);

  // ===================== PREVIEW BUTTON =====================
  document.getElementById("previewSack").onclick = () => {
    window.location.href = "preview.html";
  };
});