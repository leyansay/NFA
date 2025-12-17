// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
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
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const database = firebase.database();

// Format date function
function formatDate(dateString) {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return 'Invalid Date';
  }
}

// Format date for period (without time)
function formatPeriodDate(dateString) {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Period date formatting error:", error);
    return 'Invalid Date';
  }
}

// Load report data
async function loadReportData() {
  console.log("Loading report data...");
  
  try {
    // Show loading message
    document.getElementById('reportBody').innerHTML = 
      '<tr><td colspan="25" class="loading">Loading transactions from database...</td></tr>';

    // Get transactions from Firebase
    const transactionsRef = database.ref('transactions');
    console.log("Fetching from database...");
    
    const snapshot = await transactionsRef.once('value');
    console.log("Snapshot received:", snapshot.exists());

    if (!snapshot.exists()) {
      console.log("No data found in database");
      document.getElementById('reportBody').innerHTML = 
        '<tr><td colspan="25">No transactions found in database</td></tr>';
      
      // Set defaults
      document.getElementById('officerName').textContent = 'N/A';
      document.getElementById('warehouseName').textContent = 'N/A';
      document.getElementById('warehouseLocation').textContent = 'N/A';
      document.getElementById('periodFrom').textContent = 'N/A';
      document.getElementById('periodTo').textContent = 'N/A';
      document.getElementById('reportDate').textContent = formatDate(new Date());
      document.getElementById('totalTransactions').textContent = '0';
      return;
    }

    const transactions = snapshot.val();
    console.log("Transactions data:", transactions);

    // Convert transactions object to array
    const transactionsArray = Object.keys(transactions).map(key => ({
      id: key,
      ...transactions[key]
    }));

    console.log("Total transactions:", transactionsArray.length);

    // Get unique officers and warehouses
    const officers = {};
    const warehouses = {};
    let minDate = null;
    let maxDate = null;

    transactionsArray.forEach(transaction => {
      console.log("Processing transaction:", transaction.id);

      // Collect officer data
      if (transaction.officerId && transaction.officerName) {
        officers[transaction.officerId] = transaction.officerName;
      }

      // Collect warehouse data
      if (transaction.warehouseId && transaction.warehouseName) {
        warehouses[transaction.warehouseId] = {
          name: transaction.warehouseName,
          location: transaction.warehouseLocation || 'N/A'
        };
      }

      // Find date range
      if (transaction.date) {
        const transDate = new Date(transaction.date);
        if (!isNaN(transDate.getTime())) {
          if (!minDate || transDate < minDate) minDate = transDate;
          if (!maxDate || transDate > maxDate) maxDate = transDate;
        }
      }
    });

    console.log("Officers:", officers);
    console.log("Warehouses:", warehouses);
    console.log("Date range:", minDate, maxDate);

    // Populate report header information
    const officerIds = Object.keys(officers);
    if (officerIds.length === 1) {
      document.getElementById('officerName').textContent = officers[officerIds[0]];
    } else if (officerIds.length > 1) {
      document.getElementById('officerName').textContent = 'Multiple Officers';
    } else {
      document.getElementById('officerName').textContent = 'N/A';
    }

    // Set warehouse information
    const warehouseIds = Object.keys(warehouses);
    if (warehouseIds.length === 1) {
      const warehouse = warehouses[warehouseIds[0]];
      document.getElementById('warehouseName').textContent = warehouse.name;
      document.getElementById('warehouseLocation').textContent = warehouse.location;
    } else if (warehouseIds.length > 1) {
      document.getElementById('warehouseName').textContent = 'Multiple Warehouses';
      document.getElementById('warehouseLocation').textContent = 'Various Locations';
    } else {
      document.getElementById('warehouseName').textContent = 'N/A';
      document.getElementById('warehouseLocation').textContent = 'N/A';
    }

    // Set period covered
    if (minDate && maxDate) {
      document.getElementById('periodFrom').textContent = formatPeriodDate(minDate);
      document.getElementById('periodTo').textContent = formatPeriodDate(maxDate);
    } else {
      document.getElementById('periodFrom').textContent = 'N/A';
      document.getElementById('periodTo').textContent = 'N/A';
    }

    // Set report generated date
    document.getElementById('reportDate').textContent = formatDate(new Date());

    // Set total transactions
    document.getElementById('totalTransactions').textContent = transactionsArray.length;

    // Populate table
    populateTable(transactionsArray);

    console.log("Report data loaded successfully");

  } catch (error) {
    console.error('Error loading report data:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    document.getElementById('reportBody').innerHTML = 
      `<tr><td colspan="25">Error loading data: ${error.message}. Check console for details.</td></tr>`;
    
    // Set error state for header fields
    document.getElementById('officerName').textContent = 'Error loading';
    document.getElementById('warehouseName').textContent = 'Error loading';
    document.getElementById('warehouseLocation').textContent = 'Error loading';
    document.getElementById('periodFrom').textContent = 'Error';
    document.getElementById('periodTo').textContent = 'Error';
    document.getElementById('reportDate').textContent = formatDate(new Date());
    document.getElementById('totalTransactions').textContent = '0';
  }
}

// Populate table with transaction data
function populateTable(transactions) {
  console.log("Populating table with", transactions.length, "transactions");
  
  const tbody = document.getElementById('reportBody');
  tbody.innerHTML = '';

  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="25">No transactions to display</td></tr>';
    return;
  }

  transactions.forEach((transaction, index) => {
    console.log(`Adding row ${index + 1}:`, transaction);
    
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td data-label="Officer ID">${transaction.officerId || ''}</td>
      <td data-label="Officer Name">${transaction.officerName || ''}</td>
      <td data-label="WH ID">${transaction.warehouseId || ''}</td>
      <td data-label="WH Name">${transaction.warehouseName || ''}</td>
      <td data-label="Period From">${transaction.periodFrom || ''}</td>
      <td data-label="Period To">${transaction.periodTo || ''}</td>
      <td data-label="Doc No.">${transaction.docNo || ''}</td>
      <td data-label="Cancelled">${transaction.cancelled || 'No'}</td>
      <td data-label="Doc Type">${transaction.docType || ''}</td>
      <td data-label="OR No.">${transaction.orNo || ''}</td>
      <td data-label="AI No.">${transaction.aiNo || ''}</td>
      <td data-label="Ref WSI">${transaction.refWSI || ''}</td>
      <td data-label="Recd/Issd">${transaction.recdIssd || ''}</td>
      <td data-label="Date">${transaction.date ? formatPeriodDate(transaction.date) : ''}</td>
      <td data-label="Activity">${transaction.activity || ''}</td>
      <td data-label="Variety">${transaction.variety || ''}</td>
      <td data-label="Sack">${transaction.sack || ''}</td>
      <td data-label="Cond.">${transaction.condition || ''}</td>
      <td data-label="Sack Wt">${transaction.sackWt || ''}</td>
      <td data-label="Age">${transaction.age || ''}</td>
      <td data-label="Pile">${transaction.pile || ''}</td>
      <td data-label="Bags">${transaction.bags || ''}</td>
      <td data-label="Gross">${transaction.gross || ''}</td>
      <td data-label="MC%">${transaction.mc || ''}</td>
      <td data-label="Net Wt">${transaction.netWt || ''}</td>
    `;
    
    tbody.appendChild(row);
  });

  console.log("Table populated successfully");
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded, initializing...");
  loadReportData();
});

// Also try loading after a short delay if DOMContentLoaded already fired
setTimeout(() => {
  if (document.getElementById('reportBody').innerHTML.includes('Loading transactions...')) {
    console.log("Retrying data load...");
    loadReportData();
  }
}, 1000);