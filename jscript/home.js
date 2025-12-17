// Small interactive behavior: toggle quick dropdown in top (example)
document.addEventListener('click', function(e){
  document.querySelectorAll('.menu-drop').forEach(d => {
    if(!d.contains(e.target) && !d.previousElementSibling?.contains(e.target)) d.style.display='none';
  });
});

// Highlight card on click
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.card').forEach(c=>c.style.transform='none');
    card.style.transform='translateY(-6px)';
  });
});

// Load sidebar
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar").innerHTML = html;

    // Setup sidebar navigation
    const goTransBtn = document.getElementById("goTrans");
    const goAccBtn = document.getElementById("goAcc");
    
    if (goTransBtn) {
      goTransBtn.addEventListener("click", () => {
        window.location.href = "transaction.html";
      });
    }
    
    if (goAccBtn) {
      goAccBtn.addEventListener("click", () => {
        window.location.href = "accountable.html";
      });
    }
    
    // IMPORTANT: Re-initialize user dropdown after sidebar loads
    // This ensures the logout button event is properly attached
    if (typeof initUserAuth === 'function') {
      setTimeout(initUserAuth, 100);
    }
  })
  .catch(err => {
    console.error("Error loading sidebar:", err);
  });