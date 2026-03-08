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

// Add this endpoint to your server.js file
app.get('/api/ad-content', (req, res) => {
  const siteId = req.query.siteId;
  
  const adHtml = `
    <div class="banner-ad ad-format" style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 100%;
      margin: 10px 0;
      position: relative;
      font-family: inherit;
    ">
      <div class="ad-close" style="
        position: absolute;
        top: 10px;
        right: 15px;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        color: white;
        opacity: 0.8;
        z-index: 1;
      ">×</div>
      <div class="banner-content" style="text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">Get Instant Loan To Mpesa</h3>
        <p style="margin: 0 0 15px 0; opacity: 0.9;">Special Offer Just For You.</p>
        <a href="https://faidafunds.onrender.com/" 
           target="_blank"
           style="
             display: inline-block;
             background: white;
             color: #667eea;
             padding: 10px 25px;
             border-radius: 25px;
             text-decoration: none;
             font-weight: bold;
           "
        >Apply Now</a>
      </div>
      <div class="ad-footer" style="
        margin-top: 15px;
        font-size: 12px;
        opacity: 0.7;
        display: flex;
        justify-content: space-between;
      ">
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
      container.style.cssText = \`
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        margin: 10px 0;
        padding: 0;
        box-sizing: border-box;
      \`;
      
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

// Endpoint to serve ad HTML content
app.get('/api/ad-content', (req, res) => {
  const siteId = req.query.siteId;
  
  // You could customize ad content based on siteId
  const adHtml = `
    <div class="banner-ad ad-format" style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 100%;
      margin: 10px 0;
      position: relative;
      font-family: inherit;
    ">
      <div class="ad-close" style="
        position: absolute;
        top: 10px;
        right: 15px;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        color: white;
        opacity: 0.8;
        transition: opacity 0.3s;
        z-index: 1;
      ">×</div>
      <div class="banner-content" style="text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">Get Instant Loan To Mpesa</h3>
        <p style="margin: 0 0 15px 0; opacity: 0.9;">Special Offer Just For You.</p>
        <a href="https://faidafunds.onrender.com/" 
           class="ad-btn" 
           target="_blank"
           style="
             display: inline-block;
             background: white;
             color: #667eea;
             padding: 10px 25px;
             border-radius: 25px;
             text-decoration: none;
             font-weight: bold;
             transition: transform 0.3s;
           "
           onmouseover="this.style.transform='scale(1.05)'"
           onmouseout="this.style.transform='scale(1)'"
        >Apply Now</a>
      </div>
      <div class="ad-footer" style="
        margin-top: 15px;
        font-size: 12px;
        opacity: 0.7;
        display: flex;
        justify-content: space-between;
      ">
        <span>Ad • Faida Funds</span>
        <span>Sponsored Content</span>
      </div>
    </div>
  `;
  
  res.send(adHtml);
});

app.listen(PORT, () => {
  console.log(`Ad server running on port ${PORT}`);
});
