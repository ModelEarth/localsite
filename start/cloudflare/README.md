# Cloudflare setup

Cloudflare provides free and easy DNS management, proxy service for fast page loading, https routing using one CertifytheWeb cert [in IIS](https://model.earth/setup) for multiple domains.  Using CNAME records, you can point one domain at multiple Github repos. ([See step 4](../../start/))

You may want to leave off the proxy service for some domains. (With the proxy on, sometimes you'll need to  use the Cloudflare cache clearing button to view recent file changes.)

Important: Turn on the proxy service for domains receiving a lot of traffic, otherwise you may exceed GitHubs allowed traffic levels and encounter rate limiting.  

Nice overview of the [advantages of combining GitHub with Cloudflare](https://www.toptal.com/github/unlimited-scale-web-hosting-github-pages-cloudflare). Their sponsored project [jsdelivr](https://gomakethings.com/how-to-turn-any-github-repo-into-a-cdn/) is another great option for delivering any GitHub file via a CDN.

During setup, Cloudflare will provide nameservers to enter at your current registrar.  
You can transfer an existing domain to Cloudflare for cheaper hosting.  

## Configuration

### Go to "Speed > Optimization"  

- Auto Minify - All 3 (Javascript, CSS, HTML)  
- Brotli compression - On (the default)  
- Rocket Loader™ - Improve the paint time for pages which include JavaScript.  
- AMP Real URL - Display your site’s actual URL on your AMP pages, instead of the traditional Google AMP cache URL.  



<!--
The following set-up steps originated from the three videos here: https://httpsiseasy.com
Video 2: Under the same tab
https://www.youtube.com/watch?time_continue=1&v=mVzdEl5G0iM
-->

### Go to "SSL/TLS > Overview"  

- Select "Full" (Recommended by Cloudflare)  
- SSL/TLS Recommender - Receive an email regarding whether your website can use a more secure SSL/TLS mode.  

### Go to "SSL/TLS > Edge Certificates"  

- Always Use HTTPS - On  
- Click "Enable HSTS" - Turn on all 4 and set the Max Age Header to 12 months. (6 months is too short for hstspreload.org)  
- Minimum TLS Version: Minimum TSL 1.2 (but use TSL 1.3)  
- Leave the default of "TLS 1.3" as "On"  
- Keep on "Automatic HTTPS Rewrites" (ON by default) - Allows Cloudflare to automatically change all links in the HTML to https when appropriate, including links to external sites.  
- Certificate Transparency Monitoring - ON. Receive an email when a Certificate Authority issues a certificate for your domain.  

### hstspreload.org

Go to [hstspreload.org](https://hstspreload.org) and click two checkboxes here so browsers always preload as https.  

Optional: Test with ssllabs.com (after 24 hours)  

### You won't be able to add a true wildcard redirect under "Page Rule"

Redirects only works for subdomains that are entered in the Cloudflare DNS list.  

Choose "Forwarding URL"  

\*.yourdomain.com/\*  
https://yourdomain.com/#go=$2  

