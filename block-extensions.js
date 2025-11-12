/**
 * CodZe Extension - Block Extensions Management
 * Prevents access to chrome://extensions and hides extension management UI
 */

console.log("CodZe: Extensions management blocker active");

// Block access to chrome://extensions page
if (window.location.href.includes('chrome://extensions')) {
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        text-align: center;
        max-width: 500px;
      ">
        <h1 style="
          color: #667eea;
          font-size: 32px;
          margin-bottom: 16px;
        ">🔒 Access Restricted</h1>
        <p style="
          color: #666;
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 24px;
        ">
          Extension management is disabled while CodZe is active.
        </p>
        <p style="
          color: #999;
          font-size: 14px;
        ">
          Contact your administrator for assistance.
        </p>
      </div>
    </div>
  `;
  
  // Prevent any navigation
  window.history.pushState(null, null, window.location.href);
  window.addEventListener('popstate', () => {
    window.history.pushState(null, null, window.location.href);
  });
}

// Hide extension management buttons and menu items
function hideExtensionControls() {
  // Try to hide extension icons in toolbar
  const extensionButtons = document.querySelectorAll('[aria-label*="extension" i], [title*="extension" i], [aria-label*="manage" i]');
  extensionButtons.forEach(button => {
    if (button && !button.id?.includes('codze')) {
      button.style.display = 'none';
      button.style.visibility = 'hidden';
      button.style.pointerEvents = 'none';
    }
  });
  
  // Hide extensions menu button (puzzle piece icon)
  const menuButtons = document.querySelectorAll('button, div[role="button"]');
  menuButtons.forEach(button => {
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const title = button.getAttribute('title')?.toLowerCase() || '';
    
    if (ariaLabel.includes('extension') || title.includes('extension') ||
        ariaLabel.includes('manage') || title.includes('manage')) {
      button.style.display = 'none';
      button.style.visibility = 'hidden';
      button.style.pointerEvents = 'none';
    }
  });
}

// Run on page load and periodically
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hideExtensionControls);
} else {
  hideExtensionControls();
}

// Check every 2 seconds for new buttons that appear
setInterval(hideExtensionControls, 2000);

// Intercept right-click context menu on extension icons
document.addEventListener('contextmenu', (e) => {
  const target = e.target;
  const ariaLabel = target.getAttribute?.('aria-label')?.toLowerCase() || '';
  const title = target.getAttribute?.('title')?.toLowerCase() || '';
  
  if (ariaLabel.includes('extension') || title.includes('extension')) {
    e.preventDefault();
    e.stopPropagation();
    console.log('CodZe: Extension context menu blocked');
    return false;
  }
}, true);
