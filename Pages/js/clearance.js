const CLEARANCE = {
  "matthias": "owner",
  "grace": "senior",
  "jorah": "mod",
  "anya": "helper"
};

function getUserClearance(username) {
  return CLEARANCE[username] || "none";
}
