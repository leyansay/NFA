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
      });

    // ----- ACCOUNTABLE OFFICER MODAL -----
    const accountableModal = document.getElementById("accountableModal");
    const openAccountableBtn = document.getElementById("openModal");
    const closeAccountableBtn = document.getElementById("closeAccountable");

    openAccountableBtn.addEventListener("click", () => {
      accountableModal.style.display = "block";
    });

    closeAccountableBtn.addEventListener("click", () => {
      accountableModal.style.display = "none";
    });

    // ----- MASTERFILE MODAL -----
    const masterfileModal = document.getElementById("masterfileModal");
    const openMasterfileBtn = document.getElementById("openMasterfile");
    const closeMasterfileBtn = document.getElementById("closeMasterfile");

    openMasterfileBtn.addEventListener("click", () => {
      masterfileModal.style.display = "block";
    });

    closeMasterfileBtn.addEventListener("click", () => {
      masterfileModal.style.display = "none";
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === accountableModal) accountableModal.style.display = "none";
      if (e.target === masterfileModal) masterfileModal.style.display = "none";
    });

    // Handle Accountable Officer form submission
    document.getElementById("accountableForm").addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Accountable Officer submitted");
      accountableModal.style.display = "none";
      e.target.reset();
    });

    // Handle Masterfile form submission
    document.getElementById("masterfileForm").addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Masterfile data submitted");
      masterfileModal.style.display = "none";
      e.target.reset();
    });

    // Handle dot-menu dropdowns
document.querySelectorAll('.dot-menu').forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing on window click
    // Close any other open dropdowns first
    document.querySelectorAll('.dropdown-content').forEach(d => {
      if (d !== dot.nextElementSibling) d.style.display = 'none';
    });
    const dropdown = dot.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});

// Close dropdowns when clicking outside
window.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
});

// Example Edit/Delete actions
document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    alert('Edit clicked');
  });
});

document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    alert('Delete clicked');
  });
});
 