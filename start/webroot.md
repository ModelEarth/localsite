## 1. Activate a webroot folder on your computer

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

 On a Mac, you can add a shorthand "localsite" command in your .bash_profile file. Change /Site to your webroot:

 	alias localsite="python3 -m http.server 8887 -d /Site"
