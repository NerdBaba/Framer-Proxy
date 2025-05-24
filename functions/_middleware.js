import config from '../config.json';

export async function onRequest(context) {
  const { request } = context;
  
  // Get the framer URL from config
  const framerUrl = config.framerUrl;
  
  // Forward the request to the Framer website
  let response = await fetch(new URL(request.url.replace(new URL(request.url).origin, framerUrl)), {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  
  // Clone the response so we can modify it
  response = new Response(response.body, response);
  
  // Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  // Use HTMLRewriter to modify the page
  return new HTMLRewriter()
    // Remove Framer badges if they exist in the HTML
    .on('.__framer-badge-container', {
      element(element) {
        element.remove();
      }
    })
    .on('.__framer-badge', {
      element(element) {
        element.remove();
      }
    })
    // Inject our script to handle badges that appear dynamically
    .on('head', {
      element(element) {
        element.append(`<script>
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
        </script>`, { html: true });
      }
    })
    .transform(response);
} 