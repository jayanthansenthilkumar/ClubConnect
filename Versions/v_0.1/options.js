/**
 * Study Mode Extension - Options Page Script
 * Handles advanced settings and import/export functionality
 */

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const settingsData = document.getElementById("settingsData");
const allowedCount = document.getElementById("allowedCount");
const blockedCount = document.getElementById("blockedCount");
const extensionId = document.getElementById("extensionId");

/**
 * Load and display statistics
 */
function loadStats() {
  chrome.storage.local.get(["allowedSites", "blockedToday"], (data) => {
    allowedCount.textContent = (data.allowedSites || []).length;
    blockedCount.textContent = data.blockedToday || 0;
  });
}

/**
 * Export settings to JSON
 */
function exportSettings() {
  chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
    const settings = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      allowedSites: data.allowedSites || [],
      studyModeEnabled: data.studyModeEnabled !== false
    };
    
    settingsData.value = JSON.stringify(settings, null, 2);
    settingsData.select();
    
    showMessage("Settings exported! Copy the text to save it.", "success");
  });
}

/**
 * Import settings from JSON
 */
function importSettings() {
  try {
    const settings = JSON.parse(settingsData.value);
    
    // Validate the settings object
    if (!settings.allowedSites || !Array.isArray(settings.allowedSites)) {
      throw new Error("Invalid settings format");
    }
    
    // Confirm before importing
    if (!confirm(`Import ${settings.allowedSites.length} allowed sites? This will replace your current settings.`)) {
      return;
    }
    
    // Save the imported settings
    chrome.storage.local.set({
      allowedSites: settings.allowedSites,
      studyModeEnabled: settings.studyModeEnabled !== false
    }, () => {
      showMessage("Settings imported successfully!", "success");
      loadStats();
      settingsData.value = "";
    });
    
  } catch (error) {
    showMessage("Invalid settings data. Please check the format.", "error");
    console.error("Import error:", error);
  }
}

/**
 * Display extension ID
 */
function displayExtensionId() {
  chrome.management.getSelf((info) => {
    extensionId.textContent = info.id;
  });
}

/**
 * Show temporary message
 */
function showMessage(text, type = "info") {
  const existing = document.querySelector(".message");
  if (existing) existing.remove();
  
  const message = document.createElement("div");
  message.className = `message message-${type}`;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  message.textContent = text;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = "slideOut 0.3s ease";
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Event listeners
exportBtn.addEventListener("click", exportSettings);
importBtn.addEventListener("click", importSettings);

// Handle feedback and help links
document.getElementById("feedbackLink").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Feedback feature coming soon! For now, please contact your administrator.");
});

document.getElementById("helpLink").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Help documentation coming soon! Check the README for basic usage.");
});

// Initialize
loadStats();
displayExtensionId();

// Refresh stats every 5 seconds
setInterval(loadStats, 5000);
