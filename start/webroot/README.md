## Activating a webroot folder on your computer

The following will allow you to launch [http://localhost:8887/localsite/](http://localhost:8887/localsite/) to view multiple repos in the same webroot.

WITH A PYTHON COMMAND:

Go to the folder where you'd like your webroot to reside and run the following to view pages on localhost:  
Run this command to start localhost whenever you restart your computer.

	python -m http.server 8887

 Or run anywhere and include a path to your webroot. Change /Sites to your custom path.  
 You may be prompted to install XCode if this is your first use of Python 3.  

 	python3 -m http.server 8887 -d /Sites

If the above do not work, you can also try:  

	python -m SimpleHTTPServer 8887

If you receive the message: "This site can't provide a secure connection", [upgrade](https://www.freecodecamp.org/news/python-version-on-mac-update/) from Python 2.7 to 3+.

MORE OPTIONS:  

ON A PC: [Install IIS](https://www.techwalla.com/articles/how-to-circumvent-mcafee-dlp) to view using http://localhost/  &nbsp; With this approach you'd avoid typing the port number.


 WITH CHORME: Alternatively, you can install [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en) to view and develop pages offline using http://localhost:8887 on your computer. Web Server for Chrome also allows you to [load a custom domain](https://medium.com/@jmatix/using-chrome-as-a-local-web-server-af04baffd581). Web Server for Chrome does not work as a Brave browser extension on Mac (as of December 2019), but you can add as a Chrome extension, then utilize from within Brave.

ON A MAC: Right-click the folder where your websites reside and choose "New Terminal at Folder"  

On a Mac, you can add a shorthand "localsite" command in your .bash_profile file. Change /Site to your webroot:

 	alias localsite="python3 -m http.server 8887 -d /Site"

BUG - The above might cause the terminal to issue unneeded commands. The following kept running. Need to test again. <!-- http://localhost:8887/localsite/info/#show=recyclers&state=GA -->

    Serving HTTP on :: port 8887 (http://[::]:8887/) ...
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:37] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:37] "GET /cgi-bin/clwarn.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:42] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:42] "GET /cgi-bin/count.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:47] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:47] "GET /cgi-bin/Count.cgi HTTP/1.1" 404 -
    ::1 - - [17/Feb/2022 12:07:49] "GET /localsite/info/ HTTP/1.1" 200 -
    ::1 - - [17/Feb/2022 12:07:50] "GET /localsite/js/map.js HTTP/1.1" 304 -
    ::1 - - [17/Feb/2022 12:07:50] "GET /localsite/info/data/ga-layers.json?callback=callback&_=1645117669719 HTTP/1.1" 200 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:52] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:52] "GET /cgi-bin/faqmanager.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:57] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:07:57] "GET /cgi-bin/FormHandler.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:02] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:02] "GET /cgi-bin/FormMail.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:07] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:07] "GET /cgi-bin/guestbook.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:12] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:12] "GET /cgi-bin/help.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:17] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:17] "GET /cgi-bin/hi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:23] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:23] "GET /cgi-bin/index.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:28] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:28] "GET /cgi-bin/index.pl HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:33] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:33] "GET /cgi-bin/index.sh HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:38] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:38] "GET /cgi-bin/login.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:43] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:43] "GET /cgi-bin/mailit.pl HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:48] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:48] "GET /cgi-bin/mt/mt-check.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:53] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:53] "GET /cgi-bin/mt/mt-load.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:58] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:08:58] "GET /cgi-bin/mt-static/mt-check.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:09:03] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:09:03] "GET /cgi-bin/mt-static/mt-load.cgi HTTP/1.1" 404 -
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:09:08] code 404, message File not found
    ::ffff:192.168.127.92 - - [17/Feb/2022 12:09:08] "GET /cgi-bin/ncbook/book.cgi HTTP/1.1" 404 -


[Set up steps](../)