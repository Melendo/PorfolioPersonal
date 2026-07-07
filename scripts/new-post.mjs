import { promises as fs } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const rootDir = process.cwd();
const blogJsonPath = path.join(rootDir, 'data', 'blog', 'blog.json');
const blogDir = path.join(rootDir, 'data', 'blog');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  const args = process.argv.slice(2);
  let slug = '';
  let title = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[i + 1];
      i++;
    } else if (args[i] === '--title' && args[i + 1]) {
      title = args[i + 1];
      i++;
    }
  }

  // Interactive fallback
  if (!slug) {
    slug = await askQuestion('Introduce el slug del post (ej. mi-entrada): ');
  }
  if (!title) {
    title = await askQuestion('Introduce el título del post: ');
  }

  if (!slug || !title) {
    console.error('Error: slug y título son obligatorios.');
    process.exit(1);
  }

  // Clean slug
  slug = slugify(slug);

  // Read blog.json
  let blogEntries = [];
  try {
    const raw = await fs.readFile(blogJsonPath, 'utf8');
    blogEntries = JSON.parse(raw);
  } catch (err) {
    console.error('No se pudo leer blog.json:', err.message);
    process.exit(1);
  }

  // Check if exists
  if (blogEntries.some(entry => entry.slug === slug)) {
    console.error(`Error: Ya existe una entrada con el slug "${slug}".`);
    process.exit(1);
  }

  // Add new entry
  const today = new Date().toISOString().split('T')[0];
  const newEntry = {
    slug,
    title,
    date: today,
    tags: [],
    excerpt: 'Escribe aquí una brebe descripción de la entrada',
    content: `blog/${slug}.md`
  };

  blogEntries.push(newEntry);

  // Write blog.json
  try {
    await fs.writeFile(blogJsonPath, JSON.stringify(blogEntries, null, 2) + '\n', 'utf8');
    console.log('✔ blog.json actualizado correctamente.');
  } catch (err) {
    console.error('No se pudo guardar blog.json:', err.message);
    process.exit(1);
  }

  // Create markdown file
  const mdPath = path.join(blogDir, `${slug}.md`);
  const mdContent = `Escribe aquí tu contenido...
`;

  try {
    await fs.writeFile(mdPath, mdContent, 'utf8');
    console.log(`✔ Archivo markdown creado en: data/blog/${slug}.md`);
  } catch (err) {
    console.error('No se pudo crear el archivo markdown:', err.message);
    process.exit(1);
  }

  console.log('🎉 ¡Estructura del post creada con éxito!');
}

run();
