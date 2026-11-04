(() => {
  "use strict";

  const form = document.getElementById("pinForm");
  const pinInput = document.getElementById("websitePin");
  const error = document.getElementById("pinError");
  const button = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    error.textContent = "";
    button.disabled = true;
    button.textContent = "Checking PIN…";
    try {
      const response = await fetch("api.php?action=login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ pin: pinInput.value })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not unlock the planner.");
      window.location.replace("index.php");
    } catch (requestError) {
      error.textContent = requestError.message || "Could not reach the planner server. Try again.";
      pinInput.select();
      button.disabled = false;
      button.textContent = "Unlock planner";
    }
  });
})();
