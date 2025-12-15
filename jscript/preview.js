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

    // Set report date
    document.getElementById('reportDate').textContent = new Date().toLocaleString();

    // Load transactions
    function loadTransactionsForPrint() {
      const tbody = document.getElementById("reportBody");
      const transactionsRef = database.ref("transactions");

      transactionsRef.once("value")
        .then((snapshot) => {
          tbody.innerHTML = "";

          if (!snapshot.exists()) {
            tbody.innerHTML = `
              <tr>
                <td colspan="25" style="text-align:center;">No transactions found</td>
              </tr>`;
            document.getElementById('totalTransactions').textContent = '0';
            return;
          }

          let transactionCount = 0;
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            transactionCount++;

            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${data.officerId || "-"}</td>
              <td>${data.officerName || "-"}</td>
              <td>${data.warehouseId || "-"}</td>
              <td>${data.warehouseName || "-"}</td>
              <td>${data.periodFrom || "-"}</td>
              <td>${data.periodTo || "-"}</td>
              <td>${data.documentNo || "-"}</td>
              <td>${data.cancelled ? "Yes" : "No"}</td>
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
              <td>${data.sackWeight || 0}</td>
              <td>${data.age || 0}</td>
              <td>${data.pileNo || 0}</td>
              <td>${data.numberOfBags || 0}</td>
              <td>${data.grossWeight || 0}</td>
              <td>${data.moistureContent || 0}</td>
              <td>${data.netWeight || 0}</td>
            `;

            tbody.appendChild(tr);
          });

          document.getElementById('totalTransactions').textContent = transactionCount;
          console.log(`Loaded ${transactionCount} transactions for print`);
        })
        .catch((error) => {
          console.error("Error loading transactions:", error);
          tbody.innerHTML = `
            <tr>
              <td colspan="25" style="text-align:center; color: red;">Error loading transactions: ${error.message}</td>
            </tr>`;
        });
    }

    // Load data when page loads
    window.addEventListener('DOMContentLoaded', loadTransactionsForPrint);