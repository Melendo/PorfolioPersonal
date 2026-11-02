# Guía para agentes

## Contexto del proyecto

- Es un portfolio y blog estático generado con Node.js nativo y ES Modules.
- `build.mjs` es el generador principal: lee `data/`, usa componentes de `resources/` y escribe el sitio compilado en `dist/`.
- `resources/components.mjs` contiene la generación de HTML reutilizable y `resources/styles.css` la presentación.
- `serve.mjs` sirve `dist/` para la previsualización local.
- La guía funcional y de despliegue está en [README.md](README.md); enlázala en lugar de duplicarla aquí.

## Dónde hacer cambios

- Para datos personales, experiencia, formación, tecnologías y enlaces, editar `data/inicio/profile.json`.
- Para proyectos, actualizar `data/projects/projects.json`, el Markdown en `data/projects/<id>/info.md` y la imagen `gen.webp` correspondiente.
- Para artículos, mantener la entrada en `data/blog/blog.json` y el contenido Markdown indicado por su campo `content`.
- Usar `scripts/new-project.mjs` y `scripts/new-post.mjs` para crear estructuras nuevas y evitar registros incompletos.
- Cambiar `build.mjs` o `resources/` solo cuando el comportamiento o la presentación común deban cambiar para todas las páginas.
- No editar manualmente `dist/`: es salida generada y se recrea en cada compilación.

## Comandos de trabajo

```bash
npm install          # instalar Node.js dependencies (Node.js 20+)
npm run build        # generar dist/
npm run preview      # servir dist/ en http://localhost:4173
npm run clean        # eliminar dist/
```

No hay suite de tests configurada en `package.json`. Para cualquier cambio, ejecutar al menos `npm run build`; si afecta a la interfaz, comprobar también `npm run preview` en las rutas `/`, `/projects/` y `/blog/`.

## Convenciones y precauciones

- Mantener JSON válido y conservar las claves que consume `build.mjs`.
- Usar slugs en minúsculas y separados por guiones; los scripts los normalizan automáticamente.
- Escapar contenido dinámico mediante los helpers existentes del generador en vez de interpolar valores sin protección.
- Mantener el HTML semántico, el diseño responsive y la compatibilidad con rutas estáticas profundas.
- Revisar que las imágenes referenciadas existan y que las rutas funcionen tanto desde `dist/` como desde GitHub Pages.
- No introducir dependencias de producción sin una necesidad clara; el proyecto usa APIs nativas de Node.js y CSS propio.