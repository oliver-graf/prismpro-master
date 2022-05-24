# Webserver Client

This is a lightweight react app for rendering a few pages inside of the prism pro webserver.

See App.jsx for the main routing logic. The client logic is built and included in buildZip step of building the webserver.

## Begin
Start by installing the dependencies using `npm install`


## Build
To build run `npm run build`


## Dev Mode
To run in development mode run `npm run devserver` this will allow you to see changes locally at localhost:3005. See webpack.devserver.js for configuring the proxy. You can either choose to proxy all requests from this devserver to a local version of the webserver (this means you will also need to run the webserver locally) or you can point it an an IP address:Port number which is already running an instance of the webserver (i.e. 10.45.32.157:8080)
