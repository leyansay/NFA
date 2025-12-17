// ============================================
// USER AUTHENTICATION & DISPLAY (GLOBAL)
// Use this script on ALL pages EXCEPT login page
// ============================================

// Check if user is logged in
function checkAuth() {
  const currentUser = sessionStorage.getItem("currentUser");
  
  if (!currentUser) {
    // No user logged in, redirect to login
    window.location.href = "index.html";
    return null;
  }
  
  return JSON.parse(currentUser);
}

// Display username
function displayUsername() {
  const user = checkAuth();
  
  if (user) {
    console.log("Displaying user:", user); // Debug log
    
    const usernameDisplay = document.querySelector('.username-display');
    const userRoleDisplay = document.querySelector('.user-role');
    const userInitials = document.querySelector('.user-initials');
    
    if (usernameDisplay) {
      usernameDisplay.textContent = `Hi, ${user.username}`;
    }
    
    if (userRoleDisplay) {
      userRoleDisplay.textContent = user.role;
    }
    
    if (userInitials) {
      const initials = user.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      userInitials.textContent = initials;
    }
  }
}

// Toggle user dropdown
function setupUserDropdown() {
  const userInfo = document.getElementById('userInfoDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  
  console.log('Setting up dropdown...', { userInfo, logoutBtn }); // Debug
  
  if (userInfo) {
    // Remove old event listeners by cloning
    const newUserInfo = userInfo.cloneNode(true);
    userInfo.parentNode.replaceChild(newUserInfo, userInfo);
    
    // Add click event to toggle dropdown
    newUserInfo.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('User info clicked!'); // Debug
      newUserInfo.classList.toggle('active');
    });
    
    // Setup logout button inside the cloned element
    const newLogoutBtn = newUserInfo.querySelector('#logoutBtn');
    if (newLogoutBtn) {
      newLogoutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Logout clicked!'); // Debug
        logout();
      });
    }
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const userInfoElement = document.getElementById('userInfoDropdown');
    if (userInfoElement && !userInfoElement.contains(e.target)) {
      userInfoElement.classList.remove('active');
    }
  });
}

// Logout function
function logout() {
  console.log('Logging out...'); // Debug
  sessionStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Initialize function
function initUserAuth() {
  displayUsername();
  setupUserDropdown();
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUserAuth);
} else {
  initUserAuth();
}

// Backup initialization after delay
setTimeout(initUserAuth, 300);