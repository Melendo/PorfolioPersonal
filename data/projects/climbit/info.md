ClimbIt surge con el objetivo de digitalizar y simplificar la experiencia de escalada en rocódromo, conectando en una misma plataforma tanto a escaladores como a gestores de instalaciones. La aplicación permite pasar de un seguimiento informal del rendimiento a un control continuo, estructurado y medible de la actividad.

Como proyecto desarrollado en el contexto de un Trabajo de Fin de Grado, su enfoque combina utilidad práctica y base técnica sólida: autenticación segura, arquitectura modular, persistencia relacional, API REST y cliente web moderno con capacidades PWA. Esto permite que la herramienta sea útil tanto en escritorio como en móvil, incluyendo escenarios de conectividad limitada.

Además del seguimiento individual, ClimbIt incorpora una dimensión social para reforzar la motivación: comparación de actividad, perfiles públicos y gestión de amistades. El resultado es una plataforma que no solo organiza información de rocódromos y rutas, sino que también impulsa el progreso personal y la competición sana entre amigos.

En frontend está implementado como SPA hash-based y además incorpora capacidades PWA (service worker, caché de datos/imágenes y modo offline en lectura).

El sistema permite:

- Registro y autenticación con JWT.
- Gestión de perfil (apodo, descripción y foto de perfil).
- Suscripción/desuscripción a rocódromos.
- Consulta y edición de rocódromos, zonas y rutas según permisos.
- Carga de imágenes y recursos gráficos (logos, mapas SVG, imágenes de pistas).
- Seguimiento del progreso con estadísticas globales y por rocódromo.
- Funcionalidades sociales (amistades, solicitudes, perfil público y ranking mensual).