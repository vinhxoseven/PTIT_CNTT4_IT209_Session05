const http = require('node:http');
const config = require('./config.json');

const server = http.createServer((req, res) => {
  if (config.debug) {
    console.log(`${req.method} ${req.url}`);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' && req.url === '/health') {
    res.end(JSON.stringify({
      status: 'ok',
      port: config.port,
      debug: config.debug,
      env: config.env || 'development',
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/hello') {
    res.end(JSON.stringify({ message: 'Xin chào từ feature-api!' }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`API: http://127.0.0.1:${config.port}`);
  console.log(`Environment: ${config.env || 'development'}; debug: ${config.debug}`);
});
