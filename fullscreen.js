let isFullScreenMode = false;
let fullScreenCheckInterval = null;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enableFullScreen") {
    enableFullScreenMode();
    sendResponse({ success: true });
  } else if (request.action === "disableFullScreen") {
    disableFullScreenMode();
    sendResponse({ success: true });
  }
  return true;
});
function enableFullScreenMode() {
  isFullScreenMode = true;
  requestFullScreen();
  startFullScreenMonitoring();
  document.addEventListener('contextmenu', preventContextMenu);
  document.addEventListener('keydown', preventExitKeys);
  console.log("CodZe: Full screen mode enabled");
}
function disableFullScreenMode() {
  isFullScreenMode = false;
  stopFullScreenMonitoring();
  document.removeEventListener('contextmenu', preventContextMenu);
  document.removeEventListener('keydown', preventExitKeys);
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => console.log(err));
  }
  console.log("CodZe: Full screen mode disabled");
}
function requestFullScreen() {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(err => {
      console.log("Full screen request failed:", err);
      showFullScreenPrompt();
    });
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  } else {
    showFullScreenPrompt();
  }
}
function startFullScreenMonitoring() {
  document.addEventListener('fullscreenchange', handleFullScreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
  fullScreenCheckInterval = setInterval(() => {
    if (isFullScreenMode && !document.fullscreenElement) {
      showExitWarning();
      setTimeout(() => {
        if (isFullScreenMode) {
          requestFullScreen();
        }
      }, 2000);
    }
  }, 2000);
}
function stopFullScreenMonitoring() {
  document.removeEventListener('fullscreenchange', handleFullScreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
  if (fullScreenCheckInterval) {
    clearInterval(fullScreenCheckInterval);
    fullScreenCheckInterval = null;
  }
}
function handleFullScreenChange() {
  if (!document.fullscreenElement && isFullScreenMode) {
    console.log("CodZe: Full screen exited, attempting to re-enter...");
    showExitWarning();
    setTimeout(() => {
      if (isFullScreenMode) {
        requestFullScreen();
      }
    }, 1500);
  }
}
function preventContextMenu(e) {
  if (isFullScreenMode) {
    e.preventDefault();
    showWarningToast("Right-click is disabled in CodZe mode");
    return false;
  }
}
function preventExitKeys(e) {
  if (!isFullScreenMode) return;
  if (e.key === 'F11') {
    e.preventDefault();
    showWarningToast("F11 is disabled in CodZe mode");
    return false;
  }
  if (e.altKey && e.key === 'Tab') {
    e.preventDefault();
    showWarningToast("Alt+Tab is disabled in CodZe mode");
    return false;
  }
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault();
    showWarningToast("Closing tabs is disabled in CodZe mode");
    return false;
  }
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    showWarningToast("Opening new tabs is disabled in CodZe mode");
    return false;
  }
}
function showFullScreenPrompt() {
  const overlay = createOverlay();
  overlay.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; text-align: center;">
      <h2 style="color: #667eea; margin-top: 0;">🔒 CodZe Full Screen Mode</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        CodZe requires full screen mode for distraction-free studying.
      </p>
      <p style="color: #666; font-size: 14px;">
        Press <strong>F11</strong> or click the button below to enter full screen.
      </p>
      <button onclick="this.getRootNode().host.click()" style="
        background: #667eea;
        color: white;
        border: none;
        padding: 15px 30px;
        font-size: 16px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 20px;
        font-weight: bold;
      ">Enter Full Screen</button>
    </div>
  `;
  overlay.addEventListener('click', () => {
    requestFullScreen();
    overlay.remove();
  });
  document.body.appendChild(overlay);
}
function showExitWarning() {
  showWarningToast("⚠️ Please stay in full screen mode while CodZe is active", 3000);
}
function showWarningToast(message, duration = 2000) {
  const existing = document.getElementById('codze-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'codze-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f44336;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    animation: slideDown 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999998;
  `;
  return overlay;
}
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);
chrome.storage.local.get(['studyModeEnabled', 'fullScreenLock'], (data) => {
  if (data.studyModeEnabled && data.fullScreenLock !== false) {
    setTimeout(() => enableFullScreenMode(), 1000);
  }
});