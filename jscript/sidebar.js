// ================= LOAD SIDEBAR =================
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;

    const $ = id => document.getElementById(id);

    const libraryDropdown = $("libraryDropdown");
    const libraryMenu = $("libraryMenu");

    // ================= HELPER =================
    function closeLibrary() {
      libraryDropdown?.classList.remove("active");
      libraryMenu?.classList.remove("show");
    }

    // ================= MAIN MENU =================
    const menuMap = {
      goHome: "homepage.html",
      goAcc: "accountable.html",
      goTrans: "transaction.html",
      goInv: "inventory.html",
      goReport: "report.html"
    };

    Object.keys(menuMap).forEach(id => {
      const el = $(id);
      if (!el) return;

      el.addEventListener("click", () => {
        closeLibrary(); // ✅ close only for main menus
        setActiveMenu(id);
        window.location.href = menuMap[id];
      });
    });

    function setActiveMenu(activeId) {
      document.querySelectorAll(".menu > li")
        .forEach(li => li.classList.remove("active"));
      $(activeId)?.classList.add("active");
    }

    // ================= LIBRARY DROPDOWN =================
    if (libraryDropdown && libraryMenu) {
      libraryDropdown.addEventListener("click", e => {
        e.stopPropagation();
        libraryDropdown.classList.toggle("active");
        libraryMenu.classList.toggle("show");
      });

      libraryMenu.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", e => {
          e.stopPropagation(); // ✅ keep open

          const lib = item.getAttribute("data-library");
          localStorage.setItem("selectedLibrary", lib);

          const pages = {
            1: "activity.html",
            2: "cereal.html",
            3: "location.html",
            4: "sack.html",
            5: "warehouse.html",
            6: "variety.html",
            7: "examination-status.html",
            8: "signatories.html",
            9: "client.html"
          };

          if (pages[lib]) window.location.href = pages[lib];
        });
      });
    }

    // ================= ACTIVE PAGE LOGIC =================
    let page = location.pathname.split("/").pop();
    if (!page || page === "") page = "homepage.html";

    const pageMap = {
      "homepage.html": "goHome",
      "accountable.html": "goAcc",
      "transaction.html": "goTrans",
      "inventory.html": "goInv",
      "report.html": "goReport"
    };

    if (pageMap[page]) {
      $(pageMap[page])?.classList.add("active");
      closeLibrary(); // ✅ close on non-library pages
    }

    // ================= AUTO OPEN LIBRARY (ONLY LIBRARY PAGES) =================
    const libraryPages = {
      "activity.html": "1",
      "cereal.html": "2",
      "location.html": "3",
      "sack.html": "4",
      "warehouse.html": "5",
      "variety.html": "6",
      "examination-status.html": "7",
      "signatories.html": "8",
      "client.html": "9"
    };

    if (libraryPages[page]) {
      libraryDropdown?.classList.add("active");
      libraryMenu?.classList.add("show");

      const activeItem = libraryMenu.querySelector(
        `li[data-library="${libraryPages[page]}"]`
      );
      activeItem?.classList.add("active");
    }

    // ================= PREVENT BACK =================
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () =>
      window.history.pushState(null, "", window.location.href);
  })
  .catch(err => console.error("Failed to load sidebar:", err));
