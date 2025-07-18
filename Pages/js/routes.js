// Define required clearance for each page
const PAGE_CLEARANCE = {
  "projects.html": "helper",
  "staff.html": "mod",
  "owner.html": "owner"
};

function checkPageAccess(page) {
  const user = getLoggedInUser();
  const userClearance = getUserClearance(user);
  const required = PAGE_CLEARANCE[page];

  const levels = ["none", "helper", "mod", "senior", "owner"];

  if (!user || levels.indexOf(userClearance) < levels.indexOf(required)) {
    window.location.href = "unauthorized.html"; // fallback page
  }
}
