const db = firebase.database();

function login(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("errorMessage");

  // Hide error message and clear text
  errorBox.textContent = "";
  errorBox.classList.remove("show");

  if (!usernameInput || !passwordInput) {
    errorBox.textContent = "Please fill in all fields";
    errorBox.classList.add("show");
    return;
  }

  db.ref("users").once("value")
    .then(snapshot => {
      console.log("Database snapshot:", snapshot.val());

      let isValid = false;
      let loggedInUser = null;

      snapshot.forEach(child => {
        const user = child.val();
        console.log("Checking user:", user); 

        if (user.username === usernameInput && user.password === passwordInput) {
          isValid = true;
          loggedInUser = {
            uid: child.key,
            username: user.username,
            role: user.role || "User",
            email: user.email || ""
          };
        }
      });

      if (isValid && loggedInUser) {
        console.log("Login success!", loggedInUser);
        
        // Store user info in sessionStorage
        sessionStorage.setItem("currentUser", JSON.stringify(loggedInUser));
        
        // Redirect to homepage
        window.location.href = "homepage.html";
      } else {
        console.log("Login failed");
        errorBox.textContent = "Invalid username or password";
        errorBox.classList.add("show"); 
      }
    })
    .catch(err => {
      console.error(err);
      errorBox.textContent = "System error. Try again.";
      errorBox.classList.add("show"); 
    });
}