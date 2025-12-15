const db = firebase.database();

function login(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("errorMessage");

  errorBox.textContent = "";

  if (!usernameInput || !passwordInput) {
    errorBox.textContent = "Please fill in all fields";
    return;
  }

 db.ref("users").once("value")
  .then(snapshot => {
    console.log("Database snapshot:", snapshot.val()); // <-- debug

    let isValid = false;

    snapshot.forEach(child => {
      const user = child.val();
      console.log("Checking user:", user); // <-- debug

      if (user.username === usernameInput && user.password === passwordInput) {
        isValid = true;
      }
    });

    if (isValid) {
      console.log("Login success!"); // <-- debug
      window.location.href = "homepage.html";
    } else {
      console.log("Login failed"); // <-- debug
      errorBox.textContent = "Invalid username or password";
    }
  })
  .catch(err => {
    console.error(err);
    errorBox.textContent = "System error. Try again.";
  });

}