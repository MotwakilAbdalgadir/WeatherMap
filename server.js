/**
 * server.js - Zero-Dependency Local Development HTTP Server
 * Uses native Node.js built-in modules ('http', 'fs', 'path') to serve the
 * WeatherMap application with proper MIME types for ES Modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Normalize and parse request URL
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Default to index.html for root requests
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`🌍 WeatherMap Local Server is running!`);
  console.log(`👉 Open in your browser: ${url}`);
  console.log(`   Press Ctrl+C to stop the server.`);
  console.log(`======================================================\n`);

  // Automatically open browser on Windows
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  }
});
