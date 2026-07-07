import { promises as fs } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const rootDir = process.cwd();
const projectsJsonPath = path.join(rootDir, 'data', 'projects', 'projects.json');
const projectsDir = path.join(rootDir, 'data', 'projects');

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
  let title = '';
  let role = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      title = args[i + 1];
      i++;
    } else if (args[i] === '--role' && args[i + 1]) {
      role = args[i + 1];
      i++;
    }
  }

  // Interactive fallback
  if (!title) {
    title = await askQuestion('Introduce el título del proyecto: ');
  }
  if (!role) {
    role = await askQuestion('Introduce el rol o tipo de proyecto: ');
  }

  if (!title || !role) {
    console.error('Error: título y rol son obligatorios.');
    process.exit(1);
  }

  // Generate ID based on title
  const id = slugify(title);

  // Read projects.json
  let projects = [];
  try {
    const raw = await fs.readFile(projectsJsonPath, 'utf8');
    projects = JSON.parse(raw);
  } catch (err) {
    console.error('No se pudo leer projects.json:', err.message);
    process.exit(1);
  }

  // Check if exists
  if (projects.some(project => project.id === id)) {
    console.error(`Error: Ya existe un proyecto con el id "${id}".`);
    process.exit(1);
  }

  // Add new entry
  const newProject = {
    id,
    title,
    role,
    stack: [],
    description: 'Escribe aquí una brebe descripción del proyecto...',
    links: []
  };

  projects.push(newProject);

  // Write projects.json
  try {
    await fs.writeFile(projectsJsonPath, JSON.stringify(projects, null, 2) + '\n', 'utf8');
    console.log('✔ projects.json actualizado correctamente.');
  } catch (err) {
    console.error('No se pudo guardar projects.json:', err.message);
    process.exit(1);
  }

  // Create project folder, copy default image and create info.md
  const projectFolder = path.join(projectsDir, id);
  try {
    await fs.mkdir(projectFolder, { recursive: true });
    console.log(`✔ Directorio de proyecto creado en: data/projects/${id}`);
  } catch (err) {
    console.error('No se pudo crear el directorio del proyecto:', err.message);
    process.exit(1);
  }

  const genWebpSource = path.join(rootDir, 'resources', 'gen.webp');
  const genWebpTarget = path.join(projectFolder, 'gen.webp');
  try {
    await fs.copyFile(genWebpSource, genWebpTarget);
    console.log(`✔ Imagen por defecto copiada a: data/projects/${id}/gen.webp`);
  } catch (err) {
    console.warn('Advertencia: No se pudo copiar resources/gen.webp:', err.message);
  }

  const infoPath = path.join(projectFolder, 'info.md');
  const infoContent = `Escribe aquí la descripción detallada del proyecto...
`;

  try {
    await fs.writeFile(infoPath, infoContent, 'utf8');
    console.log(`✔ Archivo markdown de info creado en: data/projects/${id}/info.md`);
  } catch (err) {
    console.error('No se pudo crear el archivo info.md:', err.message);
    process.exit(1);
  }

  console.log('🎉 ¡Estructura del proyecto creada con éxito!');
}

run();
