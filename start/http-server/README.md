[HTTP Server setup](../steps/)
# NPX HTTP Server

Another option is the npx http-server which loads URLs without including .html
(Since Observable's build to dist removes .html in links.)

npx http-server requires installing a local cert.&nbsp; (Not recommended until we document steps.)

	python3 -m venv env
	source env/bin/activate
	npx http-server

The npx http-server command displays your local site here:
[http://127.0.0.1:8080](http://127.0.0.1:8080)

Issue: This site can’t provide a secure connection
Solution: You'll need to [install a cert](https://stackoverflow.com/questions/35127383/npm-http-server-with-ssl) on your local machine.

TO DO: [Please fork](https://github.com/modelearth/localsite/) and add npx http-server cert install steps here.


# VS Code HTTP Server

**VS Code Issue to resolve** (use the [python http-server command](../steps/) for now): 
A redirect loop occurs when using VS Code's built-in live server extension. VS Code defaults to port 8000, but the port number might not be a factor. (You can comment our the localsite.js include, but you'll lose other filter functionality.)  &nbsp;Please help resolve.

TO DO: [Please fork](https://github.com/modelearth/localsite/) and add VS Code notes here.


