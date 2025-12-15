 // small interactive behavior: toggle quick dropdown in top (example)
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

      
      document.getElementById("goTrans").addEventListener("click", () => {
        window.location.href = "transaction.html";
      });
      document.getElementById("goAcc").addEventListener("click", () => {
        window.location.href = "accountable.html";
      });
    });