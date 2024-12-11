// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import process from 'node:process';
import path from 'node:path';
import url from 'node:url';
import express from 'express';
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

// Start the server.
var server = app.listen(PORT, 'localhost');
server.on('listening', () => {
  // Let our calling process know that we're running.
  console.log("Server started");
});

// Close the server when STDIN closes.
// This means that the Gecko process launching this server exited.
process.stdin.resume();
process.stdin.on('end', () => {
  server.close();
});
