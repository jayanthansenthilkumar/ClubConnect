/**
 * CodZe Extension - Background Service Worker
 * Manages URL blocking rules based on an allowlist of educational websites
 */

const defaultAllowedSites = [
  "khanacademy.org",
  "coursera.org",
  "edx.org",
  "wikipedia.org",
  "stackoverflow.com",
  "github.com",
  "mdn.mozilla.org",
  "w3schools.com",
  "youtube.com",
  "google.com"
];

// Initialize rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("CodZe Extension installed");
  
  // Set default allowed sites and enable CodZe by default
  chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
    if (!data.allowedSites) {
      chrome.storage.local.set({ allowedSites: defaultAllowedSites });
    }
    // Always enable by default on installation
    if (data.studyModeEnabled === undefined) {
      chrome.storage.local.set({ studyModeEnabled: true });
    }
    
    // Enable blocking rules immediately
    updateBlockingRules(data.allowedSites || defaultAllowedSites, true);
  });
});
// Listen for changes in storage (when user updates allowed sites or toggle mode)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowedSites || changes.studyModeEnabled) {
    chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
      updateBlockingRules(data.allowedSites, data.studyModeEnabled);
      
      // Fullscreen mode is disabled - no longer toggling fullscreen lock
      // Site blocking functionality remains active
    });
  }
});

/**
 * Updates the blocking rules based on allowed sites list
 * @param {Array} allowedSites - List of allowed domain names
 * @param {Boolean} enabled - Whether study mode is enabled
 */
function updateBlockingRules(allowedSites, enabled = true) {
  if (!enabled) {
    // Remove all blocking rules when study mode is disabled
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      const ruleIds = rules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds
      });
    });
    return;
  }

  // Prepare excluded domains (normalize URLs and handle subdomains)
  const excludedDomains = [];
  
  allowedSites.forEach((site) => {
    // Remove protocol, www, and trailing slash
    let cleanSite = site.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    
    // Add the domain
    excludedDomains.push(cleanSite);
    
    // Also add www version if not already present
    if (!cleanSite.startsWith('www.')) {
      excludedDomains.push('www.' + cleanSite);
    }
  });

  // Also allow Chrome internal pages and extension pages
  excludedDomains.push("chrome.google.com");
  excludedDomains.push("chromewebstore.google.com");
  
  // CRITICAL: Need to also allow the extension's own blocked.html page
  // Get extension ID dynamically
  const extensionId = chrome.runtime.id;

  // Create blocking rule - Block all except allowed domains
  const blockingRule = {
    id: 1,
    priority: 1,
    action: { 
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: "*://*/*",  // Match all HTTP/HTTPS URLs
      excludedRequestDomains: excludedDomains,  // EXCEPT these domains
      resourceTypes: ["main_frame"]
    }
  };

  // Update dynamic rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1], // Remove existing rule if any
    addRules: [blockingRule]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
      console.error("Rule details:", JSON.stringify(blockingRule, null, 2));
    } else {
      console.log("✅ CodZe: Blocking rules updated successfully!");
      console.log("📚 Allowed sites:", excludedDomains);
      console.log("🚫 All other sites will be blocked");
    }
  });
}
/**
 * Toggle full screen lock on all tabs
 * @param {Boolean} enabled - Whether to enable full screen lock
 */
function toggleFullScreenLock(enabled) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      // Skip chrome:// and extension pages
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, {
          action: enabled ? "enableFullScreen" : "disableFullScreen"
        }).catch(err => {
          // Silently ignore - content script may not be loaded yet
          console.log("Could not send message to tab:", tab.id, err.message);
        });
      }
    });
  });
  
  // Store preference
  chrome.storage.local.set({ fullScreenLock: enabled });
}

/**
 * Debug function - Check current blocking rules
 * Call this from console: chrome.runtime.sendMessage({action: "checkRules"})
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkRules") {
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      console.log("Current blocking rules:", rules);
      sendResponse({ rules: rules });
    });
    return true;
  }
  
  if (request.action === "testSite") {
    chrome.storage.local.get("allowedSites", (data) => {
      const allowed = data.allowedSites || [];
      sendResponse({ 
        allowed: allowed,
        message: `Testing against ${allowed.length} allowed sites`
      });
    });
    return true;
  }
});