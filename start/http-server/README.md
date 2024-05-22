# NPX HTTP Server

Another option is the npx http-server which loads URLs without including .html
(Since Observable's build to dist removes .html in links.)

	python3 -m venv env
	source env/bin/activate
	npx http-server

The npx http-server command displays your local site here:
[http://127.0.0.1:8080](http://127.0.0.1:8080)

Issue: This site can’t provide a secure connection
Solution: You'll need to [install a cert](https://stackoverflow.com/questions/35127383/npm-http-server-with-ssl) on your local machine. (Please [send us](../../info/input/) the steps to add here.)