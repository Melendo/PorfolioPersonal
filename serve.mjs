import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8']
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = path.join(distDir, pathname);

    if (pathname.endsWith('/')) {
      filePath = path.join(distDir, pathname, 'index.html');
    }

    let content = await readFileIfExists(filePath);
    if (!content && !path.extname(filePath)) {
      content = await readFileIfExists(`${filePath}.html`);
    }

    if (!content) {
      const fallback = path.join(distDir, '404.html');
      content = await readFileIfExists(fallback);
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(content || 'Not found');
      return;
    }

    response.writeHead(200, { 'content-type': mimeTypes.get(path.extname(filePath)) || 'text/plain; charset=utf-8' });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(String(error));
  }
});

server.listen(port, () => {
  console.log(`Serving dist/ at http://localhost:${port}`);
});

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}