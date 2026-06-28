# PorfolioPersonal
Plantilla de portfolio y blog estático minimalista, diseñada para ofrecer la mínima fricción a la hora de publicar tu portfolio. Permite gestionar todo el contenido a través de archivos JSON/Markdown y automatiza la compilación y despliegue a GitHub Pages o servidor propio mediante GitHub Actions.

# Descripción detallada
El proyecto nace con el objetivo de ofrecer una carta de presentación profesional, ligera y extremadamente fácil de mantener. Al desacoplar completamente los datos de la presentación, los usuarios pueden gestionar su perfil, experiencia laboral, habilidades, proyectos y blog editando archivos JSON y Markdown planos sin necesidad de alterar el código del generador.

Para reducir al máximo el rozamiento al configurar y desplegar el portfolio, el repositorio está preconfigurado para compilarse y publicarse automáticamente en **GitHub Pages** en cuestión de minutos. Además, incluye flujos automatizados de **GitHub Actions** que permiten crear nuevos posts o proyectos de forma interactiva directamente desde la interfaz web de GitHub sin necesidad de instalar Node.js ni clonar el repositorio localmente. Para usuarios avanzados, también ofrece soporte para despliegues autónomos en servidores propios mediante contenedores Docker.

## Índice
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución y Uso](#ejecución-y-uso)
- [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
- [Contribuciones](#contribuciones)
- [Licencia y Créditos](#licencia-y-créditos)

## Requisitos Previos
Dependiendo de cómo decidas gestionar y desplegar tu portfolio, los requisitos varían:

### A. Gestión Web (Sin Código - Recomendado)
Si prefieres actualizar tus datos directamente desde GitHub y usar GitHub Pages:
- Una cuenta de **GitHub**.
- No requiere instalar ningún entorno ni runtime local.

### B. Desarrollo Local y Servidor Propio (Avanzado)
Si deseas realizar pruebas locales o desplegar en tu propia infraestructura:
- **Runtime o Lenguaje:** Node.js v20+ (ES Modules)
- **Gestor de paquetes:** npm (incluido con Node.js)
- **Despliegue propio (Docker):** Docker y Docker Compose
- **Red Docker externa:** `red_tunnels` (si se utiliza el archivo `docker-compose.yml` por defecto)
- **Pipeline propia:** GitHub Actions self-hosted runner instalado en tu servidor local

---

## Instalación
Para modificar el portfolio en tu máquina local:

1. Clona el repositorio:
```bash
git clone https://github.com/Melendo/PorfolioPersonal.git
cd PorfolioPersonal
```

2. Instala las dependencias del proyecto:
```bash
npm install
```

---

## Configuración
El contenido dinámico del portfolio está totalmente separado de la lógica en la carpeta `data/`.

> [!IMPORTANT]
> **Edición manual obligatoria del contenido:**
> Las pipelines de GitHub Actions y los scripts locales **solo automatizan la creación de las plantillasde los proyectos y blogs**
> **La personalización de tu información**, tales como tus datos personales de contacto, biografía, experiencias, así como la redacción de los artículos y el detalle de tus proyectos, **debe hacerse editando manualmente los archivos correspondientes dentro de la carpeta `data/`** (bien localmente o bien usando el editor web de GitHub).

Formas de crear proyectos y entradas del blog:

### Opción 1: Desde la Interfaz Web de GitHub (Mínima Fricción)
Puedes crear nuevas estructuras vacías directamente desde la pestaña **Actions** en GitHub sin tocar código:

1. **Crear nueva entrada de blog:**
   - Ve a la pestaña **Actions** de tu repositorio.
   - Selecciona el flujo de trabajo **Nueva entrada de Blog** (`.github/workflows/new-post.yml`).
   - Haz clic en *Run workflow*, rellena el **título** y el **slug** (ej. `mi-primer-post`) y ejecútalo.
   - *GitHub Actions creará y actualizará automáticamente `data/blog/blog.json` y creará la plantilla en `data/blog/mi-primer-post.md` por ti. Ahora deberás editar ese archivo Markdown para escribir tu artículo.*

2. **Crear nuevo proyecto:**
   - Ve a la pestaña **Actions** de tu repositorio.
   - Selecciona el flujo de trabajo **Nuevo Proyecto** (`.github/workflows/new-project.yml`).
   - Haz clic en *Run workflow*, rellena el **título** y tu **rol** (ej. `Desarrollador Web`) y ejecútalo.
   - *El flujo registrará la entrada en `data/projects/projects.json` y creará el directorio del proyecto con su plantilla `data/projects/<id>/info.md` y un espacio para la imagen de portada.*

### Opción 2: Desarrollo Local
Si prefieres trabajar de forma local desde tu terminal:

- **Crear post de blog:**
  ```bash
  node scripts/new-post.mjs --slug "mi-entrada" --title "Mi nueva entrada"
  ```
- **Crear nuevo proyecto:**
  ```bash
  node scripts/new-project.mjs --title "Nombre del Proyecto" --role "Desarrollador"
  ```

### Estructura de Archivos a Editar:
- **Perfil de usuario:** Edita `data/inicio/profile.json` para tus datos personales, redes, formación y experiencia.
- **Imagen de perfil:** Reemplaza la imagen `data/inicio/FP.jpeg` por tu foto de perfil.
- **Detalle de proyectos:** Edita `data/projects/<id>/info.md` en formato Markdown y añade su imagen en `data/projects/<id>/gen.webp`.
- **Artículos de blog:** Edita los archivos `.md` indicados en la clave `"content"` de cada artículo registrado en `data/blog/blog.json`.

---

## Ejecución y Uso

### A. Despliegue en GitHub Pages (Método Recomendado)
La pipeline automática definida en `.github/workflows/deploy.yml` compila tu portfolio y lo publica en GitHub Pages tras cada commit en `main`.

Para activarlo en tu repositorio de GitHub:
1. Ve a **Settings** > **Pages** en tu repositorio clonado.
2. En la sección **Build and deployment** > **Source**, selecciona **GitHub Actions**.
3. ¡Listo! A partir de ese momento, cada cambio desencadenará el despliegue automático.

### B. Previsualización Local (Entorno de Desarrollo)
Si quieres probar tus cambios en tu equipo antes de subirlos a GitHub:
1. Genera la web estática en la carpeta `dist/`:
   ```bash
   npm run build
   ```
2. Levanta el servidor local de vista previa:
   ```bash
   npm run preview
   ```
   *Disponible en `http://localhost:4173`.*
3. Limpia los archivos generados:
   ```bash
   npm run clean
   ```

### C. Despliegue Alternativo (Servidor Propio y Docker)
Si cuentas con tu propio servidor (por ejemplo, Debian) y prefieres auto-alojar el proyecto:

1. **Docker Compose:** Levanta el contenedor de producción con Nginx en segundo plano:
   ```bash
   docker compose up --build -d
   ```
   > [!NOTE]
   > Por defecto, el archivo `docker-compose.yml` está configurado para unirse a una red Docker externa llamada `red_tunnels` (pensada para túneles privados de Cloudflare). Si prefieres exponer un puerto clásico, añade la sección `ports` en la definición del servicio.

2. **Pipeline en Servidor Propio:** La pipeline `.github/workflows/deployServer.yml` está preparada para ejecutarse en un **self-hosted runner** instalado en tu propio servidor. Al hacer push a `main`, descargará los cambios y ejecutará la reconstrucción del contenedor automáticamente.

---

## Arquitectura y Stack Tecnológico
El portfolio utiliza una arquitectura limpia, modular y estática sin dependencias externas en producción para garantizar velocidad y portabilidad:
- **Core (Generador Estático):** Desarrollado desde cero en Node.js nativo a través de `build.mjs`. Renderiza layouts y componentes nativos y parsea Markdown a HTML.
- **Frontend:** Estructura en HTML5 semántico y presentación basada en CSS puro y moderno (responsivo y con soporte para modo oscuro a través de variables CSS).
- **Servidores de Contenido:** Nginx (`nginx:alpine`) para producción y un servidor HTTP nativo Node.js sin dependencias en `serve.mjs` para pruebas locales.
- **Automatización y Despliegue (DevOps):**
  - **GitHub Actions:** Gestión automática de contenido (`.github/workflows/new-post.yml` y `.github/workflows/new-project.yml`) y despliegue a GitHub Pages (`.github/workflows/deploy.yml`).
  - **Docker & Compose:** Integración de compilación multi-etapa y túneles de red externa en servidor propio mediante `.github/workflows/deployServer.yml`.

---

## Contribuciones
Si deseas contribuir al desarrollo de este proyecto, por favor sigue los siguientes pasos:
1. Haz un Fork del repositorio.
2. Crea una nueva rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz un commit claro siguiendo convenciones (`git commit -m 'Añade nueva funcionalidad'`).
4. Sube los cambios a tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre una Pull Request explicando detalladamente los cambios realizados.

---

## Licencia y Créditos

### Licencia
Este proyecto está bajo la Licencia [Apache 2.0](LICENSE) - ver el archivo [LICENSE](LICENSE) para más detalles.

### Créditos y Agradecimientos
- Desarrollado por [Melendo](https://github.com/Melendo).
