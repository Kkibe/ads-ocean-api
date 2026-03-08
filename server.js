// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// API endpoint to track ad impressions
app.post('/api/track-impression', express.json(), (req, res) => {
  const { siteId, userId } = req.body;
  // Here you could log impressions to a database
  console.log(`Ad impression from site: ${siteId}`);
  res.json({ success: true });
});

// API endpoint to track ad clicks
app.post('/api/track-click', express.json(), (req, res) => {
  const { siteId, userId } = req.body;
  // Here you could log clicks to a database
  console.log(`Ad click from site: ${siteId}`);
  res.json({ success: true });
});

// Endpoint to serve ad HTML content
app.get('/api/ad-content', (req, res) => {
  const siteId = req.query.siteId;
  
  // Using your exact UI styles
  const adHtml = `
    <style>
      /* Ad format common styles */
      .ad-format {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          text-align: center;
          padding: .5rem;
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 300px;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: white;
      }

      .ad-format:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      }

      .ad-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: .5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #f1f5f9;
          font-size: 0.5rem;
          color: #94a3b8;
      }

      .banner-content {
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          color: white;
          border-radius: 6px;
          padding: 1.5rem;
      }

      .banner-ad h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
      }

      .banner-ad p {
          font-size: 0.85rem;
          margin-bottom: 1rem;
          opacity: 0.9;
      }

      .ad-btn {
          display: inline-block;
          background: white;
          color: #4f46e5;
          text-decoration: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
      }

      .ad-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
      }

      .ad-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          line-height: 1;
          backdrop-filter: blur(2px);
      }

      .ad-close:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.1);
      }

      .ad-close:active {
          transform: scale(0.95);
      }
    </style>

    <div class="banner-ad ad-format">
      <div class="ad-close">x</div>
      <div class="banner-content">
        <h3>Get Instant Loan To Mpesa</h3>
        <p>Special Offer Just For You.</p>
        <a href="https://faidafunds.onrender.com/" class="ad-btn" target="_blank">Apply Now</a>
      </div>
      <div class="ad-footer">
        <span>Ad • Faida Funds</span>
        <span>Sponsored Content</span>
      </div>
    </div>
  `;
  
  res.send(adHtml);
});

// Main ad script endpoint
app.get('/ad.js', (req, res) => {
  const siteId = req.query.siteId || 'default';
  
  // Set content type to JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  
  // Send the ad script with the siteId embedded
  const scriptContent = `
    (function() {
      const siteId = "${siteId}";
      const adServerUrl = "${req.protocol}://${req.get('host')}";
      
      // Create ad container
      const container = document.createElement('div');
      container.id = 'faida-funds-ad';
      
      // Check if ad was shown in this session
      const adShown = sessionStorage.getItem('faida_ad_shown');
      const adClosed = sessionStorage.getItem('faida_ad_closed');
      
      if (!adShown && !adClosed) {
        // Fetch ad HTML from server
        fetch(adServerUrl + '/api/ad-content?siteId=' + siteId)
          .then(response => response.text())
          .then(html => {
            container.innerHTML = html;
            document.currentScript.parentNode.insertBefore(container, document.currentScript);
            
            // Mark ad as shown
            sessionStorage.setItem('faida_ad_shown', 'true');
            
            // Track impression
            fetch(adServerUrl + '/api/track-impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ siteId: siteId, userId: getUserId() })
            });
            
            // Setup close button
            const closeBtn = container.querySelector('.ad-close');
            if (closeBtn) {
              closeBtn.addEventListener('click', function() {
                container.style.display = 'none';
                sessionStorage.setItem('faida_ad_closed', 'true');
              });
            }
            
            // Track clicks
            const adLinks = container.querySelectorAll('a');
            adLinks.forEach(link => {
              link.addEventListener('click', function(e) {
                fetch(adServerUrl + '/api/track-click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ siteId: siteId, userId: getUserId() })
                });
              });
            });
          })
          .catch(error => console.error('Failed to load ad:', error));
      }
      
      // Helper function to get or create user ID
      function getUserId() {
        let userId = localStorage.getItem('faida_user_id');
        if (!userId) {
          userId = 'user_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('faida_user_id', userId);
        }
        return userId;
      }
    })();
  `;
  
  res.send(scriptContent);
});

app.listen(PORT, () => {
  console.log(`Ad server running on port ${PORT}`);
});
