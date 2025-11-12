/**
 * CodZe Extension - Content Script
 * FULLSCREEN MODE IS DISABLED
 * This file is kept for compatibility but does not enforce fullscreen
 */

console.log("CodZe: Site blocking active. Fullscreen mode is disabled.");

// Listen for messages but do nothing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("CodZe: Fullscreen disabled. Ignoring message:", request.action);
  sendResponse({ success: false, message: "Fullscreen mode is disabled" });
  return true;
});
// All fullscreen functions have been removed
// Fullscreen mode is permanently disabled