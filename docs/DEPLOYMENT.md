# Despliegue

## Suposiciones validas desde el codigo

El backend esta preparado para ejecutarse como proceso Node.js detras de un proxy HTTPS:

- `app.set('trust proxy', 1)`
- cookies con `secure: true`
- CORS con allowlist configurable

No se detectaron archivos de despliegue para:

- Docker
- docker-compose
- Nginx
- Render
- Vercel
- PM2
- GitHub Actions

Por tanto, la estrategia de despliegue debe considerarse manual o externa al repositorio.

## Requisitos de entorno

| Requisito | Detalle |
| --- | --- |
| Node.js | Runtime compatible con ESM y `fetch` global |
| PostgreSQL | Accesible via `DATABASE_URL` |
| Supabase | Proyecto con bucket para imagenes |
| OpenAI | API key habilitada |
| Pexels | API key habilitada |
| Resend | API key habilitada para reset password |
| HTTPS | Necesario por `secure: true` en cookies |

## Variables de entorno

Variables minimas para produccion:

```env
PORT=3000
ALLOWED_ORIGINS=https://frontend.example.com
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
SUPABASE_IMAGE_BUCKET=user-images
JWT_ACCESS_SECRET=strong-secret
JWT_REFRESH_SECRET=another-strong-secret
FRONTEND_URL=https://frontend.example.com
RESEND_API_KEY=re_xxx
OPENAI_API_KEY=sk-proj-xxx
OPENAI_MODEL=gpt-4.1-mini
PEXELS_API_KEY=pexels-xxx
USER_IMAGE_MAX_ITEMS=50
USER_IMAGE_MAX_AGE_DAYS=90
USER_IMAGE_MAX_DIMENSION=1920
USER_IMAGE_QUALITY=82
USER_IMAGE_MAX_UPLOAD_MB=8
USER_IMAGE_CLEANUP_INTERVAL_HOURS=12
```

## Configuracion CORS

La aplicacion:

- lee `ALLOWED_ORIGINS` como CSV;
- permite el request si el origen esta en la lista o si existe `*`;
- habilita `credentials: true`.

Ejemplo:

```env
ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
```

Nota:

- si el frontend usa cookies cross-site, debe enviar credenciales.

## Dominios y cookies

No se configura explicitamente `domain` en cookies, por lo que:

- el navegador las asociara al host del backend;
- frontend y backend deben estar configurados de forma compatible con el flujo de cookies.

Como `sameSite` es `lax` y `secure` es `true`:

- produccion debe usar HTTPS;
- para integraciones en dominios separados conviene validar comportamiento real en navegador.

## Secuencia sugerida de despliegue

1. Provisionar PostgreSQL y aplicar el esquema correspondiente.
2. Crear bucket en Supabase Storage.
3. Registrar variables de entorno.
4. Instalar dependencias con `npm install`.
5. Iniciar con `npm run dev` o un comando de proceso equivalente a `node src/index.js`.
6. Verificar login, refresh, generacion de presentaciones y subida de imagenes.

## Recomendaciones de produccion

1. Ejecutar el proceso detras de un reverse proxy HTTPS.
2. Agregar health checks y logs estructurados.
3. Separar tareas de mantenimiento de imagenes del proceso web si aumenta la carga.
4. Rotar secretos comprometidos y regenerar credenciales si estuvieron expuestas.
5. Implementar migraciones y despliegues reproducibles.

## Huecos operativos detectados

- no hay script `start` para produccion en `package.json`;
- no hay tests ni verificacion automatica antes de desplegar;
- no hay estrategia de backups documentada para PostgreSQL ni Storage.
