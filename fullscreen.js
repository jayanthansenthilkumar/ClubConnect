/**
 * CodZe Extension - Full Screen Lock Feature
 * Attempts to keep browser in full screen mode when CodZe is active
 */

let isFullScreenMode = false;
let fullScreenCheckInterval = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "enableFullScreen") {
      enableFullScreenMode();
      sendResponse({ success: true });
    } else if (request.action === "disableFullScreen") {
      disableFullScreenMode();
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("CodZe fullscreen error:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});
/**
 * Enable full screen lock mode
 */
function enableFullScreenMode() {
  isFullScreenMode = true;
  
  // Don't force full screen - just monitor and restrict actions
  // requestFullScreen(); // REMOVED - too restrictive
  
  // Monitor user actions instead
  startFullScreenMonitoring();
  
  // Prevent context menu (right-click)
  document.addEventListener('contextmenu', preventContextMenu);
  
  // Warn on certain key combinations
  document.addEventListener('keydown', preventExitKeys);
  
  // Add visual indicator that CodZe is active
  addCodZeIndicator();
  
  console.log("CodZe: Protection mode enabled");
}
/**
 * Disable full screen lock mode
 */
function disableFullScreenMode() {
  isFullScreenMode = false;
  
  // Stop monitoring
  stopFullScreenMonitoring();
  
  // Remove event listeners
  document.removeEventListener('contextmenu', preventContextMenu);
  document.removeEventListener('keydown', preventExitKeys);
  
  // Remove visual indicator
  removeCodZeIndicator();
  
  // Exit full screen if currently in it
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => console.log(err));
  }
  
  console.log("CodZe: Protection mode disabled");
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
/**
 * Monitor full screen status and re-request if exited
 */
function startFullScreenMonitoring() {
  // Listen for full screen changes
  document.addEventListener('fullscreenchange', handleFullScreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
  
  // Periodic check for suspicious activity (every 3 seconds)
  fullScreenCheckInterval = setInterval(() => {
    if (isFullScreenMode) {
      // Just log activity, don't force full screen
      console.log("CodZe: Active monitoring");
    }
  }, 3000);
}
function stopFullScreenMonitoring() {
  document.removeEventListener('fullscreenchange', handleFullScreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
  if (fullScreenCheckInterval) {
    clearInterval(fullScreenCheckInterval);
    fullScreenCheckInterval = null;
  }
}
/**
 * Handle full screen change events
 */
function handleFullScreenChange() {
  if (!document.fullscreenElement && isFullScreenMode) {
    // Just log, don't force back
    console.log("CodZe: Full screen exited");
  }
}
function preventContextMenu(e) {
  if (isFullScreenMode) {
    e.preventDefault();
    showWarningToast("Right-click is disabled in CodZe mode");
    return false;
  }
}
/**
 * Prevent certain key combinations
 */
function preventExitKeys(e) {
  if (!isFullScreenMode) return;
  
  // Ctrl+W (close tab) - warn but don't prevent
  if (e.ctrlKey && e.key === 'w') {
    showWarningToast("Warning: Closing tabs during CodZe session");
    // Don't prevent - just warn
  }
  
  // Ctrl+T (new tab) - warn but don't prevent
  if (e.ctrlKey && e.key === 't') {
    showWarningToast("Warning: Opening new tabs during CodZe session");
    // Don't prevent - just warn
  }
  
  // Ctrl+Shift+N (incognito) - prevent
  if (e.ctrlKey && e.shiftKey && e.key === 'N') {
    e.preventDefault();
    showWarningToast("Incognito mode is disabled in CodZe");
    return false;
  }
}

/**
 * Add visual indicator that CodZe is active
 */
function addCodZeIndicator() {
  // Remove existing indicator if any
  removeCodZeIndicator();
  
  const indicator = document.createElement('div');
  indicator.id = 'codze-active-indicator';
  indicator.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="width: 8px; height: 8px; background: #4caf50; border-radius: 50%; animation: pulse 2s infinite;"></span>
      <span>CodZe Active</span>
    </div>
  `;
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 999997;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  `;
  
  if (document.body) {
    document.body.appendChild(indicator);
  }
}

/**
 * Remove visual indicator
 */
function removeCodZeIndicator() {
  const indicator = document.getElementById('codze-active-indicator');
  if (indicator) {
    indicator.remove();
  }
}
/**
 * Show prompt to enter full screen
 */
function showFullScreenPrompt() {
  const overlay = createOverlay();
  
  const promptDiv = document.createElement('div');
  promptDiv.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 500px;
    text-align: center;
  `;
  
  const title = document.createElement('h2');
  title.textContent = '🔒 CodZe Full Screen Mode';
  title.style.cssText = 'color: #667eea; margin-top: 0;';
  
  const desc = document.createElement('p');
  desc.textContent = 'CodZe requires full screen mode for distraction-free studying.';
  desc.style.cssText = 'color: #333; font-size: 16px; line-height: 1.6;';
  
  const hint = document.createElement('p');
  hint.innerHTML = 'Press <strong>F11</strong> or click the button below to enter full screen.';
  hint.style.cssText = 'color: #666; font-size: 14px;';
  
  const button = document.createElement('button');
  button.textContent = 'Enter Full Screen';
  button.style.cssText = `
    background: #667eea;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    font-weight: bold;
  `;
  
  // Add click handler to button
  button.addEventListener('click', () => {
    requestFullScreen();
    overlay.remove();
  });
  
  promptDiv.appendChild(title);
  promptDiv.appendChild(desc);
  promptDiv.appendChild(hint);
  promptDiv.appendChild(button);
  overlay.appendChild(promptDiv);
  
  // Also allow clicking overlay background to enter full screen
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      requestFullScreen();
      overlay.remove();
    }
  });
  
  document.body.appendChild(overlay);
}
function showExitWarning() {
  showWarningToast("⚠️ Please stay in full screen mode while CodZe is active", 3000);
}
/**
 * Show warning toast message
 */
function showWarningToast(message, duration = 2000) {
  // Check if body exists
  if (!document.body) {
    console.warn("Cannot show toast: document.body not available");
    return;
  }
  
  // Remove existing toast
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
// Add CSS animations
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
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
`;
if (document.head) {
  document.head.appendChild(style);
}

// Check if CodZe is already active on page load
chrome.storage.local.get(['studyModeEnabled', 'fullScreenLock'], (data) => {
  if (data.studyModeEnabled && data.fullScreenLock !== false) {
    // Enable full screen mode automatically after a delay
    setTimeout(() => enableFullScreenMode(), 1000);
  }
});