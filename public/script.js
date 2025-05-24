// Function to remove Framer badges
function removeFramerBadge() {
  // Find and remove badge container
  const badgeContainers = document.querySelectorAll('.__framer-badge-container');
  badgeContainers.forEach(container => container.remove());
  
  // Find and remove badge elements
  const badges = document.querySelectorAll('.__framer-badge');
  badges.forEach(badge => badge.remove());
}

// Run badge removal on load and periodically to catch dynamically added badges
document.addEventListener('DOMContentLoaded', () => {
  // Remove initially
  removeFramerBadge();
  
  // Set up an observer to watch for new additions
  const observer = new MutationObserver(() => {
    removeFramerBadge();
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also run periodically as a fallback
  setInterval(removeFramerBadge, 1000);
}); 