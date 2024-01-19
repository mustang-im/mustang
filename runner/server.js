import process from 'node:process';
import path from 'node:path';
import url from 'node:url';
import express from 'express';
import JPCWebSocket from 'jpc-ws';
import httpProxy from 'http-proxy';

const proxies = {
  '/meet/auth': {
    target: 'https://accounts.mustang.im/auth',
    changeOrigin: true,
  },
  '/meet/controller': {
    target: 'https://controller.mustang.im',
    changeOrigin: true,
  },
  /*'/meet/signaling': {
    target: 'wss://controller.mustang.im/signaling',
    changeOrigin: true,
    ws: true,
  },*/
};

// The port on which to listen for HTTP requests.
const PORT = 5454;

const app = express();

// Proxy definitions.
for (let route in proxies) {
  let server = httpProxy.createProxyServer(proxies[route]);
  app.use(route, function(req, res) {
    server.web(req, res);
  });
}

// Serve the statically built application.
app.use(express.static(path.join(path.dirname(path.dirname(url.fileURLToPath(import.meta.url))), 'app', 'dist')));

// Try to start the server. (This will fail in developer mode.)
var server = app.listen(PORT, 'localhost');
server.on('error', console.error);

// Start a separate JPC WebSocket server.
// (It should be possible to serve the websocket and app on the same server,
// but I have no idea how you're supposed to do that during development.)
const startObject = {};
const jpcws = new JPCWebSocket(startObject);
const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.
jpcws.listen(kSecret, PORT + 1, false).then(() => {
  // Let the client know that the server has started.
  // (This would be a possible point to communicate the secret to the client.)
  console.log("Server started");
}).catch(console.error);

// Close the server when STDIN closes.
// This means that the Gecko process launching this server exited.
process.stdin.resume();
process.stdin.on('end', () => {
  jpcws.stopListening();
  server.close();
});
