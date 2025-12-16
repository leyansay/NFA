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
    
/* ===== LOGOUT ===== */
if ($("goLogout")) {
  $("goLogout").onclick = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Clear any session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear browser history and redirect
      window.location.replace("index.html");
    }
  };
}

    /* ===== ACTIVE MENU ===== */

    // Determine current page filename
    let page = location.pathname.split("/").pop();
    if (!page || page === "") page = "homepage.html";
    if (page === "index.html") page = "homepage.html";

    // Map filenames -> sidebar IDs (FIXED)
    const pageMap = {
      "homepage.html": "goHome",
      "accountable.html": "goAcc",
      "transaction.html": "goTrans",
      "inventory.html": "goInv",
      "report.html": "goReport"
    };

    const activeId = pageMap[page];
    if (activeId && $(activeId)) {
      document.querySelectorAll(".menu li")
        .forEach(li => li.classList.remove("active"));
      $(activeId).classList.add("active");
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