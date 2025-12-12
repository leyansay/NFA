
  // Load sidebar and then wire up redirects + active highlight
  fetch("sidebar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("sidebar").innerHTML = html;

      // Safe-get helper
      const $ = id => document.getElementById(id);

      // Redirects (only add if element exists)
      if ($("goHome")) $("goHome").onclick = () => window.location.href = "homepage.html";
      if ($("goAcc"))  $("goAcc").onclick  = () => window.location.href = "accountable.html";
      if ($("goTrans")) $("goTrans").onclick = () => window.location.href = "transaction.html";
      if ($("goInv"))  $("goInv").onclick  = () => window.location.href = "inventory.html";
      if ($("goRep"))  $("goRep").onclick  = () => window.location.href = "report.html";

      // Determine current page filename (fallbacks for root/index)
      let page = location.pathname.split("/").pop(); // e.g. "homepage.html"
      if (!page || page === "") page = "homepage.html"; // when served at "/"
      if (page === "index.html") page = "homepage.html"; // if you use index

      // Map filenames -> sidebar IDs
      const pageMap = {
        "homepage.html": "goHome",
        "accountable.html": "goAcc",
        "transaction.html": "goTrans",
        "inventory.html": "goInv",
        "report.html": "goRep"
      };

      const activeId = pageMap[page];
      if (activeId && $(activeId)) {
        // remove active class from any other items (optional)
        document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
        $(activeId).classList.add('active');
      }
    })
    .catch(err => {
      console.error("Failed to load sidebar:", err);
    });

  // If sidebar is included directly in the page (not via fetch),
  // run fallback on DOMContentLoaded so highlighting still works:
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById("sidebar")?.innerHTML?.trim()) return; // sidebar absent or empty
    // the fetch callback already handles highlight; nothing else to do here
  });
