import { promises as fs } from 'node:fs';
import path from 'node:path';
import { EmailIcon, LinkedInIcon, GitHubIcon, YouTubeIcon, HomeIcon, ProjectsIcon, BlogIcon, SunIcon, MoonIcon } from './resources/components.mjs';

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'data');
const assetsDir = path.join(rootDir, 'resources');
const distDir = path.join(rootDir, 'dist');
const buildId = Date.now();

const profile = await readJson(path.join(dataDir, 'inicio', 'profile.json'));
const projects = await readJson(path.join(dataDir, 'projects', 'projects.json'));
const blogEntries = await readJson(path.join(dataDir, 'blog', 'blog.json'));

const blogPosts = await Promise.all(
  blogEntries.map(async (entry) => {
    const content = await readContent(entry.content);
    return {
      ...entry,
      content,
      excerpt: entry.excerpt || summarize(content)
    };
  })
);

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

await copyStaticAsset('styles.css');
await copyStaticAsset('icon.svg');
await fs.copyFile(path.join(dataDir, 'inicio', 'FP.jpeg'), path.join(distDir, 'FP.jpeg'));

const routes = ['/', '/projects/', '/blog/'];

await writePage('index.html', renderPage({
  route: '/',
  title: `${profile.name} — ${profile.headline}`,
  description: 'Portfolio estático, minimalista y offline-first para software, UI/UX y sistemas.',
  body: renderHome({ profile })
}));

await writePage('projects/index.html', renderPage({
  route: '/projects/',
  title: `Proyectos — ${profile.name}`,
  description: 'Listado de proyectos de portfolio con foco en frontend, UI/UX y arquitectura.',
  body: renderProjectsIndex({ profile, projects })
}));

await writePage('blog/index.html', renderPage({
  route: '/blog/',
  title: `Blog — ${profile.name}`,
  description: 'Artículos técnicos, documentación y notas de sistemas.',
  body: renderBlogIndex({ profile, blogPosts })
}));

for (const project of projects) {
  const route = `/projects/${slugify(project.title)}/`;
  routes.push(route);

  let infoContent = '';
  if (project.id) {
    const projectImgSrc = path.join(dataDir, 'projects', project.id, 'gen.webp');
    const projectImgDistDir = path.join(distDir, 'projects', project.id);
    const projectImgDst = path.join(projectImgDistDir, 'gen.webp');
    try {
      await fs.mkdir(projectImgDistDir, { recursive: true });
      await fs.copyFile(projectImgSrc, projectImgDst);
    } catch (err) {
      console.warn(`Could not copy image for project ${project.id}: ${err.message}`);
    }

    const projectInfoSrc = path.join(dataDir, 'projects', project.id, 'info.md');
    try {
      infoContent = await fs.readFile(projectInfoSrc, 'utf8');
    } catch (err) {
      console.warn(`Could not read info.md for project ${project.id}: ${err.message}`);
    }
  }

  await writePage(`projects/${slugify(project.title)}/index.html`, renderPage({
    route,
    title: `${project.title} — ${profile.name}`,
    description: project.description,
    body: renderProjectDetail({ profile, project, infoContent })
  }));
}

for (const post of blogPosts) {
  const route = `/blog/${slugify(post.slug)}/`;
  routes.push(route);
  await writePage(`blog/${slugify(post.slug)}/index.html`, renderPage({
    route,
    title: `${post.title} — ${profile.name}`,
    description: post.excerpt || post.title,
    body: renderBlogPost({ profile, post })
  }));
}

const html404 = renderPage({
  route: '/',
  title: `No encontrado — ${profile.name}`,
  description: 'Página no encontrada.',
  body: `
    ${renderHeader(profile, '', '/')}
    <main class="shell">
      <section class="stack stack--gap-lg">
        <p class="eyebrow">404</p>
        <h1>Página no encontrada.</h1>
        <p>El enlace no existe o se ha movido. Vuelve al inicio para seguir navegando.</p>
        <p><a class="text-link" href="${routeHref('/', '/')}">Volver al inicio</a></p>
      </section>
    </main>
  `
}).replace('<head>', '<head>\n    <base href="/">');

await writePage('404.html', html404);

function renderHome({ profile: userProfile }) {
  return `
    ${renderHeader(userProfile, 'home', '/')}
    <main class="shell">
      <div class="stack stack--gap-lg">
        <section class="hero stack stack--gap-md">
          <h1>${escapeHtml(userProfile.name)}</h1>
          <p class="lede">${escapeHtml(userProfile.headline)}</p>
          <p class="intro">${escapeHtml(userProfile.about)}</p>
        </section>

        <section class="stack stack--gap-md">
          <h2>Enlaces</h2>
          <article class="teaser">
            <ul class="link-list" aria-label="Centro de enlaces">
              <li>
                <a class="text-link" href="mailto:${escapeAttribute(userProfile.email)}">
                  [<span class="link-inner">${EmailIcon}Email</span>]
                </a>
              </li>
              <li>
                <a class="text-link" href="${escapeHtml(userProfile.linkedin)}" target="_blank" rel="noreferrer">
                  [<span class="link-inner">${LinkedInIcon}LinkedIn</span>]
                </a>
              </li>
              <li>
                <a class="text-link" href="${escapeHtml(userProfile.github)}" target="_blank" rel="noreferrer">
                  [<span class="link-inner">${GitHubIcon}GitHub</span>]
                </a>
              </li>
              <li>
                <a class="text-link" href="https://www.youtube.com/@nachomelendo3930" target="_blank" rel="noreferrer">
                  [<span class="link-inner">${YouTubeIcon}YouTube</span>]
                </a>
              </li>
            </ul>
          </article>
        </section>

        <section class="stack stack--gap-md">
          <h2>Formación</h2>
          <div class="project-list">
            <article class="teaser">
                ${userProfile.educationList.map((item) => renderDetailCard(item.title, item.meta, [])).join('')}
            </article>
          </div>
        </section>

        <section class="stack stack--gap-md">
          <h2>Idiomas</h2>
          <article class="teaser" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; width: 100%;">
            ${userProfile.languages.map((item) => `
              <div class="stack stack--gap-xs" style="flex: 1; min-width: 120px;">
                <h3>${escapeHtml(item.name)}</h3>
                <p style="color: var(--muted);">${escapeHtml(item.level)}</p>
              </div>
            `).join('')}
          </article>
        </section>

        <section class="stack stack--gap-md">
          <h2>Experiencia laboral</h2>
          <div class="project-list">
            <article class="teaser">
              ${userProfile.experience.map((item) => renderExperienceCard(item)).join('')}
            </article>
          </div>
        </section>

        <section class="stack stack--gap-md">
          <h2>Tecnologías</h2>
          <article class="teaser">
            <ul class="inline-list" aria-label="Tecnologías">
              ${userProfile.technologies.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
        </section>

        <section class="stack stack--gap-md">
          <h2>Habilidades</h2>
          <article class="teaser">
            <ul class="inline-list" aria-label="Habilidades">
              ${userProfile.skills.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
        </section>

        <section class="stack stack--gap-md">
          <h2>Más información</h2>
          <div class="project-list">
            ${renderMoreInfoCard('> Proyectos', 'Listado de los proyectos más relevantes que he realizado.', '/projects/', '[Ver proyectos]', '/', ProjectsIcon)}
            ${renderMoreInfoCard('> Blog', 'Mis pensamientos, ideas y reflexiones.', '/blog/', '[Ir al blog]', '/', BlogIcon)}
          </div>
        </section>
      </div>
    </main>
  `;
}

function renderProjectsIndex({ profile: userProfile, projects: userProjects }) {
  return `
    ${renderHeader(userProfile, 'projects', '/projects/')}
    <main class="shell">
      <div class="stack stack--gap-lg">
        <section class="hero stack stack--gap-md">
          <h1>Proyectos</h1>
          <p class="intro">Listado de los proyectos más relevantes que he realizado.</p>
        </section>

        <section class="project-list">
          ${userProjects.map((project) => renderProjectTeaser(project, '/projects/', true)).join('')}
        </section>
      </div>
    </main>
  `;
}

function renderBlogIndex({ profile: userProfile, blogPosts: userBlogPosts }) {
  const sortedPosts = userBlogPosts.slice().sort(sortByDateDesc);

  return `
    ${renderHeader(userProfile, 'blog', '/blog/')}
    <main class="shell">
      <div class="stack stack--gap-lg">
        <section class="hero stack stack--gap-md">
          <h1>Blog</h1>
          <p class="intro">Pensamientos, ideas y reflexiones.</p>
        </section>

        <section class="post-list">
          ${sortedPosts.map((post) => renderPostTeaser(post, '/blog/', true)).join('')}
        </section>
      </div>
    </main>
  `;
}

function renderProjectDetail({ profile: userProfile, project, infoContent }) {
  const route = `/projects/${slugify(project.title)}/`;

  return `
    ${renderHeader(userProfile, 'projects', route)}
    <main class="shell">
      <div class="project-detail-grid">
        <article class="stack stack--gap-lg post-article project-info">
          <section class="stack stack--gap-sm">
            <p class="eyebrow">Proyecto</p>
            <div class="project-title-container">
              ${project.id ? `
              <div class="project-logo-container mobile-only">
                <img class="project-logo-img" src="${assetHref(route, `projects/${project.id}/gen.webp`)}" alt="${escapeHtml(project.title)}">
              </div>
              ` : ''}
              <h1>${escapeHtml(project.title)}</h1>
            </div>
            <p class="lede">${escapeHtml(project.role)}</p>
          </section>

          <section class="prose">
            ${renderMarkdown(infoContent, route)}
          </section>
        </article>

        <div class="project-media stack stack--gap-lg">
          ${project.id ? `
          <div class="project-img-container desktop-only">
            <img class="project-img" src="${assetHref(route, `projects/${project.id}/gen.webp`)}" alt="${escapeHtml(project.title)}">
          </div>
          ` : ''}

          <section class="stack stack--gap-sm">
            <h2>Arquitectura y stack</h2>
            <ul class="inline-list">
              ${project.stack.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </section>

          <section class="stack stack--gap-sm">
            <h2>Enlaces</h2>
            <ul class="link-list">
              ${renderLinks(project.links, route)}
            </ul>
          </section>
        </div>
      </div>
    </main>
  `;
}

function renderBlogPost({ profile: userProfile, post }) {
  const dateLabel = formatDate(post.date);
  const route = `/blog/${slugify(post.slug)}/`;

  return `
    ${renderHeader(userProfile, 'blog', route)}
    <main class="shell">
      <article class="stack stack--gap-lg post-article">
        <section class="stack stack--gap-sm">
          <p class="eyebrow">Blog</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="meta-line"><span>${escapeHtml(dateLabel)}</span><span>${escapeHtml(post.tags.join(' · '))}</span></p>
        </section>
        <section class="prose">${renderMarkdown(post.content, route)}</section>
      </article>
    </main>
  `;
}

function renderProjectTeaser(project, currentRoute, compact = false) {
  const targetRoute = `/projects/${slugify(project.title)}/`;

  return `
    <p class="eyebrow">${escapeHtml(project.role)}</p>
    <article class="teaser project-teaser-grid">
      <div class="teaser-info">
        <div class="project-title-container">
          ${project.id ? `
          <div class="project-logo-container mobile-only">
            <img class="project-logo-img" src="${assetHref(currentRoute, `projects/${project.id}/gen.webp`)}" alt="${escapeHtml(project.title)}">
          </div>
          ` : ''}
          <h2><a class="title-link" href="${routeHref(currentRoute, targetRoute)}">${escapeHtml(project.title)}</a></h2>
        </div>
        <p>${escapeHtml(project.description)}</p>
        <br>
        <ul class="inline-list">
          ${project.stack.slice(0, compact ? 3 : project.stack.length).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        <br>
        <a class="text-link" href="${routeHref(currentRoute, targetRoute)}">[Más información]</a>
      </div>
      ${project.id ? `
      <div class="teaser-media desktop-only">
        <div class="project-img-container">
          <img class="project-img" src="${assetHref(currentRoute, `projects/${project.id}/gen.webp`)}" alt="${escapeHtml(project.title)}">
        </div>
      </div>
      ` : ''}
    </article>
    <br>
  `;
}

function renderPostTeaser(post, currentRoute, compact = false) {
  const targetRoute = `/blog/${slugify(post.slug)}/`;

  return `
    <p class="eyebrow">${escapeHtml(formatDate(post.date))}</p>
    <article class="teaser">
      <div class="stack stack--gap-xs">
        <h3><a class="text-link" href="${routeHref(currentRoute, targetRoute)}">${escapeHtml(post.title)}</a></h3>
      </div>
      <p>${escapeHtml(post.excerpt || summarize(post.content))}</p>
      <ul class="inline-list">
        ${(compact ? post.tags.slice(0, 3) : post.tags).map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}
      </ul>
    </article>
  `;
}

function renderDetailCard(title, meta, bullets) {
  return `
    
      <div class="stack stack--gap-xs">
        <p class="eyebrow">${escapeHtml(meta)}</p>
        <h3>${escapeHtml(title)}</h3>
      </div>
      ${bullets.length ? bullets.map((bullet) => `<p>${escapeHtml(bullet)}</p>`).join('') : ''}
    </br>
  `;
}



function renderExperienceCard(item) {
  return `
      <div class="stack stack--gap-xs">
        <h3>${escapeHtml(item.title)}</h3>
        <p style="margin-bottom: 1rem;" ><em>${escapeHtml(item.company)}</em> · ${escapeHtml(item.period)}</p>
      </div>
      <ul class="bullet-list">
        ${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
      </ul>
      <br>
  `;
}

function renderMoreInfoCard(title, description, href, label, currentRoute, icon) {
  return `
    <article class="teaser">
      <div class="stack stack--gap-xs">
        <h3><span class="link-inner">${icon || ''}${escapeHtml(title)}</span></h3>
      </div>
      <p>${escapeHtml(description)}</p>
      <p><a class="text-link" href="${routeHref(currentRoute, href)}">${escapeHtml(label)}</a></p>
    </article>
  `;
}

function renderHeader(userProfile, activeSection, currentRoute) {
  const navItems = [
    ['/', 'Inicio', 'home', HomeIcon],
    ['/projects/', 'Proyectos', 'projects', ProjectsIcon],
    ['/blog/', 'Blog', 'blog', BlogIcon]
  ];

  return `
    <header class="topbar">
      <a class="brand" href="${routeHref(currentRoute, '/')}">
        <span class="brand-img-container">
          <img class="brand-img" src="${assetHref(currentRoute, 'FP.jpeg')}" alt="${escapeHtml(userProfile.name)}">
        </span>
        <span class="brand-text">${escapeHtml(userProfile.acronym)}</span>
      </a>
      <nav aria-label="Principal">
        <ul class="nav-list">
          ${navItems.map(([href, label, section, icon]) => `
            <li><a class="${section === activeSection ? 'active' : ''}" href="${routeHref(currentRoute, href)}"><span class="link-inner">${icon}${label}</span></a></li>
          `).join('')}
          <li class="theme-toggle-li">
            <button class="theme-toggle-btn" aria-label="Cambiar tema" onclick="toggleTheme()">
              <span class="sun-icon">${SunIcon}</span>
              <span class="moon-icon">${MoonIcon}</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  `;
}

function renderLinks(links, currentRoute) {
  return links.map((link) => `
    <li><a class="text-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">[${escapeHtml(link.label)}]</a></li>
  `).join('');
}

function renderPage({ route, title, description, body }) {
  const currentRoute = route || '/';
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeAttribute(description)}">
    <meta name="theme-color" content="#1e1e1e">
    <link rel="icon" href="${assetHref(currentRoute, 'icon.svg')}" type="image/svg+xml">
    <link rel="stylesheet" href="${assetHref(currentRoute, 'styles.css')}?v=${buildId}">
    <title>${escapeHtml(title)}</title>
    <script>
      (function() {
        const theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1] || 'dark';
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        }
      })();
    </script>
  </head>
  <body>
    ${body}
    <footer class="site-footer shell">
      <p> Enlace al código fuente en <a class="text-link" href="https://github.com/Melendo/PorfolioPersonal" target="_blank" rel="noreferrer">[este repositorio]</a>.</p>
    </footer>
    <script>
      function toggleTheme() {
        const html = document.documentElement;
        const current = html.classList.contains('light') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        if (next === 'light') {
          html.classList.add('light');
        } else {
          html.classList.remove('light');
        }
        document.cookie = 'theme=' + next + '; path=/; max-age=31536000; SameSite=Lax';
      }
    </script>
  </body>
</html>`;
}

// Service worker generation removed

function renderMarkdown(markdown, currentRoute) {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = null;
  let codeLines = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${inlineFormat(paragraph.join(' '), currentRoute)}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const tag = listType === 'ol' ? 'ol' : 'ul';
    blocks.push(`<${tag}>${listItems.map((item) => `<li>${inlineFormat(item, currentRoute)}</li>`).join('')}</${tag}>`);
    listItems = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (inCode) {
        blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushParagraph();
      flushList();
      const level = line.match(/^#{1,3}/)[0].length;
      const text = line.replace(/^#{1,3}\s+/, '');
      blocks.push(`<h${level}>${inlineFormat(text, currentRoute)}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineFormat(line.replace(/^>\s+/, ''), currentRoute)}</blockquote>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  if (inCode && codeLines.length) {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }

  return blocks.join('\n');
}

function inlineFormat(text, currentRoute) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_match, label, href) => `<a href="${escapeHtml(routeHref(currentRoute, href))}">${label}</a>`);
}

function summarize(markdown) {
  return String(markdown)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
    ?.replace(/^#{1,6}\s+/, '')
    .slice(0, 140) || '';
}

function sortByDateDesc(left, right) {
  return new Date(right.date).getTime() - new Date(left.date).getTime();
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function routeHref(currentRoute, targetRoute) {
  const fromRoute = normalizeRoute(currentRoute);
  const target = normalizeRoute(targetRoute);
  const relative = path.posix.relative(fromRoute, target);

  if (!relative) {
    return target.endsWith('/') ? './' : '.';
  }

  return target.endsWith('/') && !relative.endsWith('/') ? `${relative}/` : relative;
}

function assetHref(currentRoute, assetName) {
  const fromRoute = normalizeRoute(currentRoute);
  return path.posix.relative(fromRoute, `/${assetName}`) || assetName;
}

function normalizeRoute(route) {
  if (!route || route === '/') {
    return '/';
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readContent(entryContent) {
  if (!entryContent) {
    return '';
  }

  if (typeof entryContent === 'string' && entryContent.trim().endsWith('.md')) {
    const filePath = path.join(dataDir, entryContent.trim());
    return fs.readFile(filePath, 'utf8');
  }

  return String(entryContent);
}

async function copyStaticAsset(fileName) {
  const source = path.join(assetsDir, fileName);
  const target = path.join(distDir, fileName);
  await fs.copyFile(source, target);
}

async function writePage(relativePath, content) {
  const filePath = path.join(distDir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}
