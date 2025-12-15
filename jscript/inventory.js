

/* =========================
   BUTTON SWITCH RICE / PALAY
========================= */
const btnRice = document.getElementById("btnRice");
const btnPalay = document.getElementById("btnPalay");
const inventoryContent = document.getElementById("inventoryContent");
const searchInput = document.getElementById("searchInput");

let currentData = [];

const riceData = [
  {code:'R-001', variety:'IR64', warehouse:'GID 1', stock:5000},
  {code:'R-002', variety:'PSB Rc18', warehouse:'GID 2', stock:3200}
];

const palayData = [
  {code:'P-001', variety:'NSIC Rc222', warehouse:'GID 1', stock:4200},
  {code:'P-002', variety:'NSIC Rc238', warehouse:'GID 2', stock:3600}
];

function renderTable(data) {
  currentData = data;
  let html = `<table class="inventory-table">
    <thead>
      <tr>
        <th>Item Code</th>
        <th>Variety</th>
        <th>Warehouse</th>
        <th>Stock</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(item => `
        <tr>
          <td>${item.code}</td>
          <td>${item.variety}</td>
          <td>${item.warehouse}</td>
          <td>${item.stock}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
  inventoryContent.innerHTML = html;
}

function loadRice() {
  btnRice.classList.add("active-btn");
  btnPalay.classList.remove("active-btn");
  renderTable(riceData);
}

function loadPalay() {
  btnPalay.classList.add("active-btn");
  btnRice.classList.remove("active-btn");
  renderTable(palayData);
}

btnRice.addEventListener("click", loadRice);
btnPalay.addEventListener("click", loadPalay);

/* =========================
   SEARCH FILTER
========================= */
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  // Determine which dataset is active
  let activeData = btnRice.classList.contains("active-btn") ? riceData : palayData;

  if(query === "") {
    // If input is empty, load the default active dataset
    renderTable(activeData);
  } else {
    // Filter based on query
    const filtered = activeData.filter(item =>
      item.code.toLowerCase().includes(query) ||
      item.variety.toLowerCase().includes(query) ||
      item.warehouse.toLowerCase().includes(query) ||
      item.stock.toString().includes(query)
    );
    renderTable(filtered);
  }
});

// Load default
loadRice();