// Custom server configuration for proper MIME type handling
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '/', true);
      const { pathname } = parsedUrl;
      // Handle MIME type issues for static assets (only in production)
      // Handle MIME type issues for static assets (prod only)
      if (!dev && pathname?.startsWith('/_next/static/css/')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (!dev && pathname?.startsWith('/_next/static/chunks/')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (!dev && pathname?.startsWith('/_next/static/media/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (!dev && pathname === '/favicon.ico') {
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  }).on('error', (e) => {
    console.error('Server listen error:', e);
    process.exitCode = 1;
  });
});
