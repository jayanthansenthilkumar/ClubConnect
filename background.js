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
chrome.runtime.onInstalled.addListener(() => {
  console.log("CodZe Extension installed");
  chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
    if (!data.allowedSites) {
      chrome.storage.local.set({ allowedSites: defaultAllowedSites });
    }
    if (data.studyModeEnabled === undefined) {
      chrome.storage.local.set({ studyModeEnabled: true });
    }
    updateBlockingRules(data.allowedSites || defaultAllowedSites, true);
  });
});
chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowedSites || changes.studyModeEnabled) {
    chrome.storage.local.get(["allowedSites", "studyModeEnabled"], (data) => {
      updateBlockingRules(data.allowedSites, data.studyModeEnabled);
      if (changes.studyModeEnabled) {
        toggleFullScreenLock(data.studyModeEnabled);
      }
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
    } else {
      console.log("Blocking rules updated. Allowed sites:", excludedDomains);
    }
  });
}
function toggleFullScreenLock(enabled) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, {
          action: enabled ? "enableFullScreen" : "disableFullScreen"
        }).catch(err => {
          console.log("Could not send message to tab:", tab.id);
        });
      }
    });
  });
  chrome.storage.local.set({ fullScreenLock: enabled });
}