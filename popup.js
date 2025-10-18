/**
 * CodZe Extension - Popup Script
 * Display-only popup showing always-active status
 */

// Ensure CodZe is always enabled
chrome.storage.local.set({ studyModeEnabled: true });

// Display current allowed sites count
chrome.storage.local.get("allowedSites", (data) => {
  const allowedSites = data.allowedSites || [];
  console.log(`CodZe: ${allowedSites.length} educational sites allowed`);
  console.log("Allowed sites:", allowedSites);
});