/**
 * CodZe Extension - Blocked Page Script
 */

// Display the blocked URL
const params = new URLSearchParams(window.location.search);
const blockedUrl = params.get('url') || document.referrer || 'Unknown URL';

if (blockedUrl && blockedUrl !== 'Unknown URL') {
  try {
    const url = new URL(blockedUrl);
    document.getElementById('blockedUrl').textContent = url.hostname;
  } catch (e) {
    document.getElementById('blockedUrl').textContent = blockedUrl;
  }
} else {
  document.getElementById('blockedUrl').textContent = 'This website';
}

// Generate motivational quotes
const quotes = [
  "Focus is the gateway to success.",
  "Stay committed to your decisions, but flexible in your approach.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Education is the most powerful weapon you can use to change the world."
];

// Handle back button click
document.querySelector('.btn-back').addEventListener('click', () => {
  history.back();
});
