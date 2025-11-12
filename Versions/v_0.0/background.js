/**
 * Study Mode Extension - Background Service Worker
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
  "youtube.com",  // For educational videos
  "google.com"    // For searching educational content
];

// Initialize rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Study Mode Extension installed");
  
  // Set default allowed sites if not already set
  chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
    if (!data.allowedSites) {
      chrome.storage.local.set({ allowedSites: defaultAllowedSites });
    }
    if (data.studyModeEnabled === undefined) {
      chrome.storage.local.set({ studyModeEnabled: true });
    }
    
    updateBlockingRules(data.allowedSites || defaultAllowedSites, data.studyModeEnabled !== false);
  });
});

// Listen for changes in storage (when user updates allowed sites)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowedSites || changes.studyModeEnabled) {
    chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
      updateBlockingRules(data.allowedSites, data.studyModeEnabled);
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

  // Prepare excluded domains (normalize URLs)
  const excludedDomains = allowedSites.map((site) => 
    site.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
  );

  // Also allow Chrome internal pages and extension pages
  excludedDomains.push("chrome.google.com");
  excludedDomains.push("chromewebstore.google.com");

  // Create blocking rule for all sites except allowed ones
  const blockingRule = {
    id: 1,
    priority: 1,
    action: { 
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: "*",
      excludedInitiatorDomains: excludedDomains,
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
    } else {
      console.log("Blocking rules updated. Allowed sites:", excludedDomains);
    }
  });
}
