function checkWallet() {
  const wallet = document.getElementById("walletInput").value.trim();
  const result = document.getElementById("result");

  if (!wallet.startsWith("0x") || wallet.length !== 42) {
    result.textContent = "❌ Invalid wallet address.";
    result.style.color = "red";
    return;
  }

  result.textContent = "⏳ Checking...";
  result.style.color = "#333";

  // Simulated backend confirmation
  fetch("/api/check-wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: wallet })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.confirmed) {
        result.textContent = "✅ Your contribution is confirmed. Thank you!";
        result.style.color = "green";
      } else {
        result.textContent = "❌ No contribution found for this wallet.";
        result.style.color = "red";
      }
    })
    .catch(() => {
      result.textContent = "⚠️ Error checking wallet. Try again later.";
      result.style.color = "orange";
    });
}

// Progress bar simulation (35%)
document.addEventListener("DOMContentLoaded", () => {
  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = "35%";
});
