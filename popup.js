const toggleMode = document.getElementById("toggleMode");
const modeStatus = document.getElementById("modeStatus");
function updateStudyMode() {
  const enabled = toggleMode.checked;  
  chrome.storage.local.set({ studyModeEnabled: enabled }, () => {
    modeStatus.textContent = enabled ? "CodZe Active" : "CodZe Disabled";
    modeStatus.className = enabled ? "status-text active" : "status-text inactive";
    const message = enabled 
      ? "CodZe enabled - Full screen mode will be activated" 
      : "CodZe disabled";
    showMessage(message, "info");
  });
}
function showMessage(text, type = "info") {
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
function loadModeStatus() {
  chrome.storage.local.get("studyModeEnabled", (data) => {
    const enabled = data.studyModeEnabled !== false;
    toggleMode.checked = enabled;
    modeStatus.textContent = enabled ? "CodZe Active" : "CodZe Disabled";
    modeStatus.className = enabled ? "status-text active" : "status-text inactive";
  });
}
toggleMode.addEventListener("change", updateStudyMode);
loadModeStatus();