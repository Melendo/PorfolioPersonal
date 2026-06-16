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
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon']
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
      if (content) {
        filePath = `${filePath}.html`;
      }
    }

    if (!content) {
      const fallback = path.join(distDir, '404.html');
      content = await readFileIfExists(fallback);
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(content || 'Not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes.get(ext) || 'text/plain; charset=utf-8';

    response.writeHead(200, { 'content-type': contentType });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderErrorPage(error));
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

// Styled error page generator for dev server errors
function renderErrorPage(error) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error del Servidor</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #1e1e1e;
        --text: #e8e4d9;
        --accent: #d2c6a2;
        --accent-strong: #f0e7cc;
        --line: rgba(232, 228, 217, 0.14);
        --shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
      }
      body {
        margin: 0;
        min-height: 100vh;
        color: var(--text);
        background: radial-gradient(circle at top, rgba(210, 198, 162, 0.08), transparent 28%), var(--bg);
        font-family: 'JetBrains Mono', 'Fira Code', 'IBM Plex Mono', monospace;
        line-height: 1.65;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        box-sizing: border-box;
      }
      .error-card {
        width: 100%;
        max-width: 50rem;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--line);
        border-radius: 0.85rem;
        box-shadow: var(--shadow);
      }
      .eyebrow {
        color: #ff5555;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      h1 {
        font-size: 2rem;
        margin: 0 0 1.5rem 0;
        line-height: 1.2;
        color: var(--accent-strong);
      }
      pre {
        overflow: auto;
        padding: 1.25rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--line);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        color: #f0e7cc;
        margin: 0;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="error-card">
      <div class="eyebrow">500 - Server Error</div>
      <h1>Error durante la compilación o ejecución</h1>
      <pre><code>${escapeHtml(error.stack || error.message || String(error))}</code></pre>
    </div>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}