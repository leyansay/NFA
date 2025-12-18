// Load sidebar and then wire up redirects + active highlight
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;

    // Safe-get helper
    const $ = id => document.getElementById(id);

    /* ===== REDIRECTS ===== */
    if ($("goHome"))   $("goHome").onclick   = () => window.location.href = "homepage.html";
    if ($("goAcc"))    $("goAcc").onclick    = () => window.location.href = "accountable.html";
    if ($("goTrans"))  $("goTrans").onclick  = () => window.location.href = "transaction.html";
    if ($("goInv"))    $("goInv").onclick    = () => window.location.href = "inventory.html";
    if ($("goReport")) $("goReport").onclick = () => window.location.href = "report.html";

    
    
    /* ===== LIBRARY DROPDOWN ===== */
    const libraryDropdown = $("libraryDropdown");
    const libraryMenu = $("libraryMenu");

    if (libraryDropdown && libraryMenu) {
      // Toggle dropdown
      libraryDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        libraryMenu.classList.toggle('show');
      });

      // Handle library selection with redirects
      const libraryItems = libraryMenu.querySelectorAll('li');
      libraryItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          
          const libraryNumber = this.getAttribute('data-library');
          console.log('Selected Library:', libraryNumber);
          
          // Store selected library in localStorage
          localStorage.setItem('selectedLibrary', libraryNumber);
          
          // Redirect to corresponding page based on library number
          const libraryPages = {
            '1': 'activity.html',
            '2': 'cereal.html',
            '3': 'location.html',
            '4': 'sack.html',
            '5': 'warehouse.html',
            '6': 'variety.html',
            '7': 'examination-status.html',
            '8': 'signatories.html',
            '9': 'client.html'
          };
          
          if (libraryPages[libraryNumber]) {
            window.location.href = libraryPages[libraryNumber];
          }
        });
      });

      // Restore previously selected library from localStorage
      const savedLibrary = localStorage.getItem('selectedLibrary');
      if (savedLibrary) {
        const savedItem = libraryMenu.querySelector(`li[data-library="${savedLibrary}"]`);
        if (savedItem) {
          savedItem.classList.add('active');
        }
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown-item')) {
          libraryDropdown.classList.remove('active');
          libraryMenu.classList.remove('show');
        }
      });
    }
    
    /* ===== ACTIVE MENU ===== */

    // Determine current page filename
    let page = location.pathname.split("/").pop();
    if (!page || page === "") page = "homepage.html";
    if (page === "index.html") page = "homepage.html";

    // Map filenames -> sidebar IDs
    const pageMap = {
      "homepage.html": "goHome",
      "accountable.html": "goAcc",
      "transaction.html": "goTrans",
      "inventory.html": "goInv",
      "report.html": "goReport"
    };

    const activeId = pageMap[page];
    if (activeId && $(activeId)) {
      document.querySelectorAll(".menu > li:not(.dropdown-item)")
        .forEach(li => li.classList.remove("active"));
      $(activeId).classList.add("active");
    }

    /* ===== ACTIVE LIBRARY MENU ITEM ===== */
    const libraryPageMap = {
      'activity.html': '1',
      'cereal.html': '2',
      'location.html': '3',
      'sack.html': '4',
      'warehouse.html': '5',
      'variety.html': '6',
      'examination-status.html': '7',
      'signatories.html': '8',
      'client.html': '9'
    };

    if (libraryPageMap[page] && libraryMenu) {
      const activeLibraryItem = libraryMenu.querySelector(`li[data-library="${libraryPageMap[page]}"]`);
      if (activeLibraryItem) {
        activeLibraryItem.classList.add('active');
      }
      // Also mark the dropdown as active
      const dropdownItem = document.querySelector('.dropdown-item');
      if (dropdownItem) {
        dropdownItem.classList.add('active');
      }
    }
  })
  .catch(err => {
    console.error("Failed to load sidebar:", err);
  });

/* Fallback (safe, but optional) */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("sidebar")?.innerHTML?.trim()) return;
});

// Prevent back button after logout
window.history.pushState(null, "", window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href);
};

const currentLibrary = localStorage.getItem('selectedLibrary');