# PorfolioPersonal

Portfolio estático y blog minimalista generado a partir de contenido local. La plantilla está pensada para ser sencilla de mantener: el contenido vive en archivos de datos, la presentación en CSS y la compilación la hace un único script de build.

## Arquitectura

- `data/`: contenido dinámico y estructura de datos del sitio (organizado en `inicio/`, `projects/` y `blog/`).
- `resources/`: recursos estáticos no dinámicos (estilos, icono y componentes de iconos).
- `build.mjs`: generador estático que renderiza a `dist/`.

## Desarrollo

```bash
npm run build
npm run preview
```

El resultado se escribe en `dist/` y puede servirse como sitio estático sin backend. `npm run preview` levanta un servidor local sobre esa carpeta.
