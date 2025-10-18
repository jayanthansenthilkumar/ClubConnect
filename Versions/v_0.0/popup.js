/**
 * Study Mode Extension - Popup Script
 * Handles user interactions in the extension popup
 */

const toggleMode = document.getElementById("toggleMode");
const modeStatus = document.getElementById("modeStatus");

/**
 * Toggle Study Mode on/off
 */
function updateStudyMode() {
  const enabled = toggleMode.checked;
  
  chrome.storage.local.set({ studyModeEnabled: enabled }, () => {
    modeStatus.textContent = enabled ? "Study Mode Active" : "Study Mode Disabled";
    modeStatus.className = enabled ? "status-text active" : "status-text inactive";
    showMessage(enabled ? "Study Mode enabled" : "Study Mode disabled", "info");
  });
}

/**
 * Show temporary message to user
 */
function showMessage(text, type = "info") {
  // Remove existing messages
  const existing = document.querySelector(".message");
  if (existing) existing.remove();
  
  const message = document.createElement("div");
  message.className = `message message-${type}`;
  message.textContent = text;
  
  document.querySelector(".popup-container").insertBefore(
    message, 
    document.querySelector(".header").nextSibling
  );
  
  setTimeout(() => message.remove(), 3000);
}

/**
 * Load current study mode status
 */
function loadModeStatus() {
  chrome.storage.local.get("studyModeEnabled", (data) => {
    const enabled = data.studyModeEnabled !== false; // Default to true
    toggleMode.checked = enabled;
    modeStatus.textContent = enabled ? "Study Mode Active" : "Study Mode Disabled";
    modeStatus.className = enabled ? "status-text active" : "status-text inactive";
  });
}

// Event listeners
toggleMode.addEventListener("change", updateStudyMode);

// Initialize
loadModeStatus();
