import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'data');
const outputPath = path.join(dataDir, 'projects.json');

const repoList = JSON.parse(execFileSync('gh', [
  'repo', 'list', 'Melendo',
  '--limit', '100',
  '--json', 'nameWithOwner,name,url,description,homepageUrl,isArchived,isFork,primaryLanguage,defaultBranchRef'
], { encoding: 'utf8' }));

const priority = new Map([
  ['Melendo/ClimbIt', 0],
  ['Melendo/BotMeriendo', 1],
  ['Melendo/Keeperly', 2],
  ['Melendo/ClubLagartos', 3],
  ['Melendo/Salnaya', 4],
  ['Melendo/PabloDLP', 5],
  ['Melendo/MemoriaClimbIt', 6],
  ['Melendo/PorfolioPersonal', 7],
  ['Melendo/Melendo', 8]
]);

const projects = [];

for (const repo of repoList) {
  const readmeText = await fetchReadme(repo.nameWithOwner);
  const title = extractTitle(readmeText) || cleanTitle(repo.name);
  const summary = extractSummary(readmeText) || cleanText(repo.description) || 'Repositorio de GitHub.';
  const stack = inferStack(repo, readmeText);
  const role = inferRole(repo, readmeText);

  projects.push({
    nameWithOwner: repo.nameWithOwner,
    id: slugify(repo.name),
    title,
    role,
    stack,
    description: trimToLength(summary, 220),
    links: buildLinks(repo)
  });
}

projects.sort((left, right) => {
  const leftPriority = priority.get(left.nameWithOwner) ?? 999;
  const rightPriority = priority.get(right.nameWithOwner) ?? 999;
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  return left.title.localeCompare(right.title, 'es');
});

const output = projects.map(({ nameWithOwner, ...entry }) => entry);

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${output.length} projects to ${outputPath}`);

async function fetchReadme(repoName) {
  try {
    const encoded = execFileSync('gh', ['api', `repos/${repoName}/readme`, '--jq', '.content'], { encoding: 'utf8' }).trim();
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function buildLinks(repo) {
  const links = [{ label: 'Repositorio', url: repo.url }];
  if (repo.homepageUrl) {
    links.push({ label: 'Demo', url: repo.homepageUrl });
  }
  return links;
}

function inferRole(repo, readmeText) {
  const text = `${repo.description || ''} ${readmeText}`.toLowerCase();

  if (text.includes('pwa') || text.includes('web/móvil') || text.includes('móvil')) return 'Aplicación web o móvil';
  if (text.includes('discord')) return 'Bot de Discord';
  if (text.includes('memoria') || repo.primaryLanguage?.name === 'TeX') return 'Memoria técnica y documentación';
  if (text.includes('portfolio') || text.includes('web') || repo.primaryLanguage?.name === 'HTML' || repo.primaryLanguage?.name === 'CSS') return 'Sitio web y experiencia visual';
  if (text.includes('docker') || text.includes('ansible') || text.includes('automat')) return 'Automatización e infraestructura';
  if (repo.primaryLanguage?.name === 'C++') return 'Proyecto académico y algoritmos';
  if (repo.primaryLanguage?.name === 'Java') return 'Proyecto académico o aplicación Java';
  return 'Repositorio de desarrollo';
}

function inferStack(repo, readmeText) {
  const text = `${repo.description || ''} ${readmeText}`.toLowerCase();
  const stack = new Set();

  if (repo.primaryLanguage?.name) stack.add(repo.primaryLanguage.name);
  if (text.includes('pwa')) stack.add('PWA');
  if (text.includes('spa')) stack.add('SPA');
  if (text.includes('docker')) stack.add('Docker');
  if (text.includes('android')) stack.add('Android');
  if (text.includes('discord')) stack.add('Discord');
  if (text.includes('postgres')) stack.add('PostgreSQL');
  if (text.includes('github actions') || text.includes('workflows')) stack.add('GitHub Actions');
  if (text.includes('ansible')) stack.add('Ansible');
  if (text.includes('latex') || repo.primaryLanguage?.name === 'TeX') stack.add('LaTeX');
  if (text.includes('uml')) stack.add('UML');
  if (text.includes('algor')) stack.add('Algoritmos');

  return Array.from(stack).slice(0, 5);
}

function extractTitle(readmeText) {
  const match = readmeText.match(/^#\s+(.+)$/m);
  return match ? cleanText(match[1]) : '';
}

function extractSummary(readmeText) {
  const lines = readmeText.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    if (/^#{1,6}\s+/.test(trimmed)) continue;

    const line = cleanText(trimmed);
    if (!line) continue;
    if (line.length < 50) continue;
    if (/^(aprobado facilito|bienvenido al repositorio|bienvenido a la guía|perspectiva de producto)$/i.test(line)) continue;

    return trimToLength(line, 240);
  }

  return '';
}

function cleanTitle(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b(v\d+)\b/gi, '')
    .trim();
}

function cleanText(value) {
  return String(value)
    .replace(/^>\s*/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimToLength(value, limit) {
  const cleaned = cleanText(value);
  return cleaned.length > limit ? `${cleaned.slice(0, limit - 1).trimEnd()}…` : cleaned;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}