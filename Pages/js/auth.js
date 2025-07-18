function loginUser() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const userData = USERS[username];

  if (!userData) {
    alert("Username not recognized.");
    return;
  }

  if (userData.password !== password) {
    alert("Incorrect password.");
    return;
  }

  // Success: store session
  localStorage.setItem("loggedInUser", username);
  window.location.href = "projects.html";
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

function getLoggedInUser() {
  return localStorage.getItem("loggedInUser");
}

function getUserClearance(username) {
  return USERS[username]?.clearance || "none";
}
