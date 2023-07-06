# Cloudflare Setup

Cloudflare provides free and easy DNS management, proxy service for fast page loading, https routing using one CertifytheWeb cert [in IIS](https://model.earth/setup) for multiple domains.  Using CNAME records, you can point one domain at multiple Github repos. ([See step 6](../../start/steps/)). Or you can pull multiple repos into one Cloudflare site using a Github [.submodules file](../submodules/).

You may want to leave off the proxy service for some domains. (With the proxy on, sometimes you'll need to  use the Cloudflare cache clearing button to view recent file changes.)

Important: Turn on the proxy service for domains receiving a lot of traffic, otherwise you may exceed GitHubs allowed traffic levels and encounter rate limiting.  

Nice overview of the [advantages of combining GitHub with Cloudflare](https://www.toptal.com/github/unlimited-scale-web-hosting-github-pages-cloudflare). Their sponsored project [jsdelivr](https://gomakethings.com/how-to-turn-any-github-repo-into-a-cdn/) is another great option for delivering any GitHub file via a CDN.

During setup, Cloudflare will provide nameservers to enter at your current registrar.  
You can transfer an existing domain to Cloudflare for cheaper hosting.  

## Configuration

These are in the walk-through when adding a new site:

- Automatic HTTPS Rewrites - On (the default)
- Always Use HTTPS - On  
- Brotli compression - On (the default)  


### Go to "Speed > Optimization"  

- Auto Minify - Javascript and CSS. Avoid HTML because comments will be removed.  
- Brotli compression - On (the default)  
- Early Hints  
- AVOID Rocket Loader™ - Currently not using since it changes javascript loading sequence, which breaks "View Dynmaic Version" link.  <!--Improve the paint time for pages which include JavaScript.  -->
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
- Minimum TLS Version: Minimum TLS 1.2 - because your server might be using 1.2<!--(but use TLS 1.3)-->  
- Leave the default of "TLS 1.3" as "On"  
- Keep on "Automatic HTTPS Rewrites" (ON by default) - Allows Cloudflare to automatically change all links in the HTML to https when appropriate, including links to external sites.  
- Certificate Transparency Monitoring - ON. Receive an email when a Certificate Authority issues a certificate for your domain.  

### hstspreload.org

Go to [hstspreload.org](https://hstspreload.org) and click two checkboxes here so browsers always preload as https.  

Optional: Test with [ssllabs.com](https://www.ssllabs.com/ssltest/analyze.html?hideResults=on&latest) (after 24 hours)  

### You won't be able to add a true wildcard redirect under "Page Rule"

Redirects only works for subdomains that are entered in the Cloudflare DNS list.  

Choose "Forwarding URL"  

\*.yourdomain.com/\*  
https://yourdomain.com/#go=$2  

### CloudFlare Firewall
Create a firewall rule to block IP's that attempt to hack a website. Websites check for hack attempts and send an email to admins with information such as the url, IP address, and url history. Since CloudFlare uses a proxy address, the IP address reported by the email is the CloudFlare proxy IP. CloudFlare includes the following header values which can be used to display non-proxied addresses: cf-connecting-ip, cf-connecting-ipv6, and x-forwarded-for. The code that checks for hack attempts checks for these header values and includes them in the email. Use the non-proxied IP addresses to create a firewall rule to block those IPs in CloudFlare. These same non-proxied IPs should be added to the Windows Firewall.

1. Perform a [Whois lookup](https://www.whois.com/whois/) for the IP address that you want to block to see what country the IP address is assigned to. In most cases, the IP address will be outside of the U.S. If it is inside the U.S., use your best judgement to determine whether to block the IP address or not, such as the amount of hack attempts from the IP address. Ensure that the IP address is not associated with CloudFlare (in case you accidently copied the CloudFlare proxied address from the hack attempt email notification). 
1. Login to the CloudFlare dashboard, then select the account and website. A firewall rule will need to be added to each website running on CloudFlare
1. Select Security > WAF > Firewall rules.
1. Select Create a firewall rule.
1. Enter the following values:
    1. Rule Name: Blocked IP Addresses
    1. Field: IP Source Address
    1. Operator: is in list
    1. Value: blocked\_ip\_list (Created via the Manage Lists link - See below)
    1. Choose action: Block
    1. Click Deploy to save and activate the firewall rule.

References:
[HTTP request headers](https://developers.cloudflare.com/fundamentals/get-started/reference/http-request-headers/#cf-connecting-ip)
[Create, edit, and delete firewall rules](https://developers.cloudflare.com/firewall/cf-dashboard/create-edit-delete-rules/)

### Manage IP Lists
The free version of CloudFlare allows 1 list to be created per account. This list can then be used in each firewall rule to block IP addresses trying to hack the websites. This allows you to enter an IP address or IP address range in one place rather than entering it for each website. A list will need to be created and maintained for each account in CloudFlare where you want to block IP addresses.

Create or access the list when creating the firewall rule (see above) or use the following steps to add an IP address to an existing list:
1. Log in to your Cloudflare account and select your account.
1. Go to Account Home > Manage Account > Configurations, and then select Lists.
1. To Create a new list:
    1. Enter a name for your list, observing the list name guidelines, such as blocked\_ip\_list.
    1. (Optional) Enter a description for the list, with a maximum length of 500 characters.
    1. For Content type, select the type of list you are creating: IP (the default)
    1. Click Create to save the list.
1. To Add or Remove IPs to an existing list:
    1. Click on the Edit link for the list.
    1. Click the Add Items button or select one or more IPs to delete and select the Remove button.
    1. Enter a single IP address or an address range (in CIDR format - see below) and an optional description. Addresses can also be added [using a CSV file](https://developers.cloudflare.com/fundamentals/global-configurations/lists/create-dashboard/#add-items-using-a-csv-file). Refer to the [IP CSV format](https://developers.cloudflare.com/fundamentals/global-configurations/lists/ip-lists/) for more information. A CSV file may be easier to use rather than entering IP addresses manually and a single csv file can be used to update each account's blocked IP list easily. 
    1. Enter additional IP addresses as needed.
    1. When all the IP addresses have been entered, click the Add to list button to save the IP addresses to the list.

#### Specifying an IP address range using CIDR format
Typically, when entering an ip address range, the range should be something like: 111.222.333.0 - 111.222.333.255. Depending on the hack attempt you may need to widen the range to something like 111.222.333.0 - 111.222.336.255. Cloudflare requires IP address ranges to be entered in CIDR format. If you are not familiar with the CIDR format, search the internet for "ip address range in cidr notation". As an example, the [IPv4 Address to CIDR Notation](https://www.ipaddressguide.com/cidr) page can be used to convert from IP addresses to CIDR format and vice-versa.


Reference:
[Create a list in the dashboard](https://developers.cloudflare.com/fundamentals/global-configurations/lists/create-dashboard/)



## Create a single-password site

Include the "functions" folder from the following repo to create the secure login: https://dev.to/charca/password-protection-for-cloudflare-pages-8ma

<!--
No longer seeing this route, double-check then delete thiL
Add a custom domain in cloudflare Pages by clicking "Create a project" at "Account Home > Pages"
-->

Workers & Pages > Pages tab > Connect to Git

Connect to your repo, which can be a private repo.

Make note of the generated subdomain where the project will be deployed.  It will be [generated subdomain].pages.dev

Under Environmental variables, add CFP_PASSWORD [your password]

Lastly, add a subdomain under Custom domains within Cloudflare pages. This will automatically create a CNAME record pointed at [generated subdomain].pages.dev after a few minutes.
