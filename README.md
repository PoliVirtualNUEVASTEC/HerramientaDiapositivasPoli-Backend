# HerramientaDiapositivasPoli Backend

Backend de una herramienta para crear y administrar presentaciones a partir de texto o archivos PDF. La aplicación expone una API construida con Express, usa PostgreSQL con Sequelize para la persistencia, Supabase para almacenamiento de imágenes y servicios de IA para generar la estructura de las diapositivas.

## Descripción

Este proyecto permite:

- Registrar y autenticar usuarios con JWT y cookies HTTP-only.
- Recuperar contraseña por correo electrónico.
- Crear presentaciones desde texto libre o desde un archivo PDF.
- Generar diapositivas y elementos con apoyo de OpenAI.
- Resolver imágenes relacionadas con el contenido usando Pexels.
- Gestionar presentaciones, diapositivas, elementos e imágenes del usuario.
- Almacenar imágenes optimizadas en Supabase Storage y ejecutar limpieza automática de archivos antiguos.

## Tecnologías y dependencias

### Dependencias principales

- `express`: servidor HTTP y definición de rutas.
- `sequelize` y `pg`: conexión y modelado sobre PostgreSQL.
- `@supabase/supabase-js`: acceso a Supabase y almacenamiento de archivos.
- `openai`: generación de presentaciones con IA.
- `pdf-parse` y `pdfjs-dist`: lectura y extracción de texto desde PDF.
- `multer`: carga de archivos.
- `sharp`: optimización y conversión de imágenes.
- `bcrypt`: hash de contraseñas.
- `jsonwebtoken`: generación y validación de tokens.
- `cookie-parser`: lectura de cookies.
- `cors`: configuración de acceso entre frontend y backend.
- `dotenv`: carga de variables de entorno.
- `nodemailer`: envío de correos para recuperación de contraseña.

### Dependencias de desarrollo

- `nodemon`: recarga automática en desarrollo.
- `standard`: reglas de estilo y linting.

## Requisitos previos

Antes de iniciar, asegúrate de contar con:

- Node.js
- npm
- Una base de datos PostgreSQL accesible mediante `DATABASE_URL`
- Un proyecto de Supabase con bucket de almacenamiento
- Claves de OpenAI y Pexels
- Una cuenta de correo para el envío de recuperación de contraseña

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con una configuración similar a esta:

```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173

DATABASE_URL=postgresql://usuario:password@host:5432/database

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_IMAGE_BUCKET=user-images

JWT_ACCESS_SECRET=tu_access_secret
JWT_REFRESH_SECRET=tu_refresh_secret

OPENAI_API_KEY=tu_openai_api_key
OPENAI_MODEL=gpt-4.1-mini

PEXELS_API_KEY=tu_pexels_api_key

EMAIL=tu_correo@gmail.com
EMAIL_PASS=tu_clave_o_app_password

USER_IMAGE_MAX_ITEMS=50
USER_IMAGE_MAX_AGE_DAYS=90
USER_IMAGE_MAX_DIMENSION=1920
USER_IMAGE_QUALITY=82
USER_IMAGE_MAX_UPLOAD_MB=8
USER_IMAGE_CLEANUP_INTERVAL_HOURS=12
```

### Notas sobre configuración

- `ALLOWED_ORIGINS` acepta varios orígenes separados por comas.
- `SUPABASE_IMAGE_BUCKET` es opcional y por defecto usa `user-images`.
- `OPENAI_MODEL` es opcional y por defecto usa `gpt-4.1-mini`.
- Las variables `USER_IMAGE_*` controlan límites, optimización y limpieza automática de imágenes.

## Instalación

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Instala las dependencias:

```bash
npm install
```

4. Crea y configura el archivo `.env`.

## Cómo iniciar el proyecto

Para ejecutar el servidor en desarrollo:

```bash
npm run dev
```

El servidor inicia en el puerto definido por `PORT`. Si no se configura, usa `3000`.

## Scripts disponibles

- `npm run dev`: inicia el backend con `nodemon`.
- `npm test`: actualmente no tiene pruebas configuradas y devuelve un mensaje por defecto.

## Estructura general de la API

Las rutas principales del proyecto son:

- `/api/users`: gestión de usuarios.
- `/api/auth`: login, refresh, logout, perfil y recuperación de contraseña.
- `/api/presentations`: creación y consulta de presentaciones.
- `/api/slides`: gestión de diapositivas.
- `/api/slide-elements`: gestión de elementos dentro de una diapositiva.
- `/api/user-images`: carga, consulta y eliminación de imágenes del usuario.

## Colaboradores

- Miguel Angel Mejía Suarez - miguel_mejia82201@elpoli.edu.co
- Juan José Estrada Vélez - juan_estrada82212@elpoli.edu.co
