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

          // Install light-weight CSS to hide elements marked with data-fp-hidden
          (function ensureHideStyle(){
            if (!document.getElementById('fp-hide-style')) {
              const style = document.createElement('style');
              style.id = 'fp-hide-style';
              style.textContent = '[data-fp-hidden="1"]{display:none!important;pointer-events:none!important;visibility:hidden!important;}';
              document.head.appendChild(style);
            }
          })();

          function hideEl(el){
            if (!el) return;
            el.setAttribute('data-fp-hidden', '1');
          }

          // Function to hide only the specified elements
          function removeTargetElements() {
            try {
              // 1) Hide the specific button by id
              const btn = document.getElementById('qnPg8pODR');
              if (btn) hideEl(btn);

              // 2) Hide the specific paragraph by its exact text content
              const paragraphs = document.querySelectorAll('p.framer-text, div[data-framer-component-type="RichTextContainer"] p, p');
              paragraphs.forEach(p => {
                if (p && typeof p.textContent === 'string' && p.textContent.trim() === 'Get 3 Free month') {
                  hideEl(p);
                }
              });

              // 3) Hide the specific anchor linking to Framer pricing with matching label text
              const anchors = document.querySelectorAll('a[href*="www.framer.com/pricing"], a[href^="https://www.framer.com/pricing"], a[href^="http://www.framer.com/pricing"]');
              anchors.forEach(a => {
                const txt = (a.textContent || '').trim();
                if (txt.includes('on Pro plan')) {
                  hideEl(a);
                }
              });
            } catch (_) {
              // fail silently
            }
          }
          
          // Run badge removal on load and periodically to catch dynamically added badges
          document.addEventListener('DOMContentLoaded', () => {
            // Remove initially
            removeFramerBadge();
            removeTargetElements();
            
            // Set up an observer to watch for new additions
            const observer = new MutationObserver(() => {
              removeFramerBadge();
              removeTargetElements();
            });
            
            // Start observing the document
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            // Also run periodically as a fallback
            setInterval(() => {
              removeFramerBadge();
              removeTargetElements();
            }, 1000);
          });
        </script>`, { html: true });
      }
    })
    .transform(response);
}
 