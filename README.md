# HerramientaDiapositivasPoli Backend

Backend en Node.js y Express para generar, almacenar y administrar presentaciones academicas. El sistema recibe texto libre o archivos PDF, usa OpenAI para estructurar diapositivas, resuelve imagenes con Pexels, persiste la informacion en PostgreSQL mediante Sequelize y almacena imagenes de usuario en Supabase Storage.

## Proposito del sistema

Este backend soporta una plataforma de creacion de presentaciones orientada a usuarios autenticados. Sus capacidades principales son:

- registro y autenticacion de usuarios con JWT en cookies HTTP-only;
- recuperacion de contrasena por correo con tokens temporales;
- generacion de presentaciones desde texto o PDF;
- persistencia de presentaciones, diapositivas y elementos editables;
- subida, optimizacion y limpieza automatica de imagenes de usuario.

## Tecnologias utilizadas

| Categoria | Tecnologia |
| --- | --- |
| Runtime | Node.js |
| Framework HTTP | Express 5 |
| ORM | Sequelize 6 |
| Base de datos | PostgreSQL |
| Autenticacion | JWT + cookies HTTP-only |
| Hashing | bcrypt |
| Archivos | multer, sharp, pdf-parse |
| Storage | Supabase Storage |
| IA | OpenAI Responses API |
| Imagenes externas | Pexels API |
| Email transaccional | Resend |
| Utilidades | cookie-parser, cors, dotenv |

## Arquitectura general

El proyecto sigue una arquitectura por capas ligera:

- `routes/` define los endpoints y compone middlewares.
- `controllers/` orquesta validacion basica, llamadas a servicios y respuestas HTTP.
- `services/` contiene la logica de negocio e integraciones externas.
- `models/` define entidades Sequelize y sus relaciones.
- `middleware/` centraliza autenticacion, uploads y ownership checks.
- `db/` encapsula conexiones a PostgreSQL y Supabase.
- `utils/` reune helpers de JWT y validacion de payloads.

## Instalacion

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env` en la raiz.

3. Configurar una base PostgreSQL accesible por `DATABASE_URL`.

4. Crear o reutilizar un bucket en Supabase Storage.

5. Configurar claves de OpenAI, Pexels y Resend.

6. Ejecutar en desarrollo:

```bash
npm run dev
```

## Variables de entorno

Variables detectadas directamente desde el codigo:

| Variable | Requerida | Uso |
| --- | --- | --- |
| `PORT` | No | Puerto HTTP. Por defecto `3000`. |
| `ALLOWED_ORIGINS` | Si en entornos browser | Lista CSV de origenes permitidos por CORS. |
| `DATABASE_URL` | Si | Conexion PostgreSQL para Sequelize. |
| `SUPABASE_URL` | Si | URL del proyecto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | Credencial de servicio para Storage. |
| `SUPABASE_IMAGE_BUCKET` | No | Bucket de imagenes. Por defecto `user-images`. |
| `JWT_ACCESS_SECRET` | Si | Firma del access token. |
| `JWT_REFRESH_SECRET` | Si | Firma del refresh token. |
| `FRONTEND_URL` | Si para reset password | Base URL del frontend para construir el enlace de recuperacion. |
| `RESEND_API_KEY` | Si para reset password | Envio de correos transaccionales. |
| `OPENAI_API_KEY` | Si | Generacion de presentaciones. |
| `OPENAI_MODEL` | No | Modelo OpenAI. Por defecto `gpt-4.1-mini`. |
| `PEXELS_API_KEY` | Si para resolver imagenes | Busqueda de imagenes. |
| `USER_IMAGE_MAX_ITEMS` | No | Limite maximo de imagenes por usuario. |
| `USER_IMAGE_MAX_AGE_DAYS` | No | TTL funcional de imagenes no accedidas. |
| `USER_IMAGE_MAX_DIMENSION` | No | Tamano maximo para resize de imagenes. |
| `USER_IMAGE_QUALITY` | No | Calidad de compresion WebP. |
| `USER_IMAGE_MAX_UPLOAD_MB` | No | Tamano maximo de upload de imagen. |
| `USER_IMAGE_CLEANUP_INTERVAL_HOURS` | No | Frecuencia del mantenimiento de imagenes. |

Ejemplo minimo:

```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me-too
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_xxx
OPENAI_API_KEY=sk-proj-xxx
PEXELS_API_KEY=pexels-xxx
```

## Scripts disponibles

| Script | Descripcion |
| --- | --- |
| `npm run dev` | Inicia el backend con `nodemon src/index.js`. |
| `npm test` | Script placeholder; actualmente falla de forma intencional. |

## Estructura de carpetas

```text
src/
  app.js
  index.js
  config/
  controllers/
  db/
  middleware/
  models/
  routes/
  schemas/
  services/
  slides_templates/
  utils/
docs/
```

## Resumen tecnico del backend

- La aplicacion esta orientada a una API REST stateful en cliente web, porque la autenticacion protegida depende de cookies.
- La generacion de presentaciones esta desacoplada en servicios: OpenAI crea la estructura, Pexels resuelve imagenes y Sequelize persiste la salida.
- El backend no usa migraciones ni pruebas automatizadas en el repositorio actual.
- Existen riesgos importantes a corregir: secretos presentes en `.env`, controles de ownership incompletos en varios recursos y una inconsistencia en el reseteo de contrasena.

## Estado actual y deuda tecnica detectada

- No existe carpeta de migraciones ni estrategia de versionado del esquema.
- Hay logging de depuracion en controladores y middlewares.
- Algunos endpoints protegidos no validan ownership del recurso, solo autenticacion.


Documentacion tecnica detallada:

- [Arquitectura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Base de datos](docs/DATABASE.md)
- [Autenticacion](docs/AUTH.md)
- [Servicios](docs/SERVICES.md)
- [Archivos](docs/FILES.md)
- [Despliegue](docs/DEPLOYMENT.md)
- [Seguridad](docs/SECURITY.md)
- [Contribucion](docs/CONTRIBUTING.md)
- [Resumen tecnico](docs/SUMMARY.md)
