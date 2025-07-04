// Library to be included in HTML pages (after passwords.js)
// Relies on button elements having IDs that match the keys in credentials.

(function() {
  function initPasswordChecks(rootFolder = "") {
    Object.keys(window.credentials).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const entry = window.credentials[btnId];
        if (!entry) {
          console.error(`No credentials found for button ID: ${btnId}`);
          return;
        }

        // Check for public access keyword 'np'
        if (entry.password === "np") {
          window.location.href = rootFolder + entry.destination + 'index.html';
          return;
        }

        const userInput = prompt("Enter the password to access this section:");
        if (userInput === entry.password) {
          // redirect to the appropriate folder (relative to Home/)
          window.location.href = rootFolder + entry.destination + 'index.html';
        } else {
          alert("Access Denied: Incorrect password.");
        }
      });
    });
  }

  // Expose the initializer globally
  window.initPasswordChecks = initPasswordChecks;
})();