# Seguridad

## Controles implementados

| Area | Implementacion actual |
| --- | --- |
| Password hashing | `bcrypt.hash(password, 10)` en registro |
| Verificacion de password | `bcrypt.compare` en login |
| Auth protegida | JWT en cookie HTTP-only |
| Refresh session | `refreshToken` persistido en tabla `User` |
| CORS | allowlist via `ALLOWED_ORIGINS` |
| Upload PDF | MIME `application/pdf`, limite 10 MB |
| Upload imagen | `image/*`, limite configurable, optimizacion con `sharp` |
| Ownership parcial | middlewares para `slide-elements` y `user-images` |

## Validaciones observadas

### Usuarios

- existe verificacion de email duplicado al registrar;
- no hay validacion fuerte de formato de email ni politica de password;
- `updateUser` acepta `req.body` sin whitelist.

### Presentaciones

- `textMiddleware` exige texto no vacio y maximo 20000 caracteres;
- `pdfMiddleware` exige PDF y tamano maximo;
- no hay limite de costo o frecuencia sobre llamadas a OpenAI.

### Elementos de diapositiva

- `validateSlideElementPayload` verifica tipos y forma minima de `content`;
- la validacion real para `image` exige `content.resolvedImage.url`.

## Hashing y secretos

### Passwords

- el registro usa bcrypt correctamente;
- el reset de contrasena no actualiza `passwordHash` de forma correcta en el codigo actual.

### Tokens

- `refreshToken` se almacena en texto plano en base de datos;
- `PasswordResetToken.token` se almacena en texto plano;
- ambos deberian almacenarse hasheados.

### Variables de entorno

Hallazgo critico:

- existe un archivo `.env` en el repositorio de trabajo con credenciales reales visibles.
- aunque `.gitignore` contiene `.env`, la presencia local de secretos operativos obliga a rotacion si hubo exposicion compartida.

## CORS

Implementacion:

- se permiten requests sin `Origin`;
- se permite cualquier origen presente en `ALLOWED_ORIGINS`;
- si se incluye `*`, se aceptan todos los origenes.

Comentario:

- es flexible, pero usar `*` junto con cookies es una mala practica operacional;
- no hay capa adicional de CSRF.

## Sanitizacion

No se detectaron librerias ni utilidades de sanitizacion HTML, SQL o JSON mas alla de:

- validaciones manuales;
- uso de Sequelize para consultas tipicas;
- schema de OpenAI para la salida generada.

Riesgos:

- contenido textual o estilos maliciosos pueden llegar al frontend si este no sanitiza;
- no hay filtrado de campos inesperados en varios endpoints de escritura.

## Rate limiting

No se detecto `express-rate-limit` ni mecanismo equivalente.

Impacto:

- `login`, `forgot-password`, `refresh` y generacion de presentaciones quedan expuestos a abuso, fuerza bruta o consumo excesivo de APIs externas.

## Riesgos potenciales principales

| Severidad | Riesgo | Evidencia |
| --- | --- | --- |
| Alta | IDOR / acceso cruzado a recursos | `presentations`, `slides` y `users` no validan ownership fino |
| Alta | Secretos expuestos | `.env` con credenciales reales en el workspace |
| Alta | Reset password defectuoso | usa `user.password` en lugar de `user.passwordHash` |
| Alta | Exposicion de datos sensibles | `GET /api/users` y `GET /api/users/:id` devuelven modelo completo |
| Media | Ausencia de CSRF dedicado | auth basada en cookies sin token CSRF |
| Media | Sin rate limiting | endpoints criticos expuestos a abuso |
| Media | Refresh token en texto plano | persistido directamente en `User` |
| Media | Logging de depuracion | `console.log` sobre inputs y flujo interno |
| Baja | Archivos publicos en Storage | depende del modelo de privacidad esperado |

## Recomendaciones prioritarias

1. Rotar inmediatamente todas las credenciales expuestas y reemplazar el `.env`.
2. Corregir `reset-password` para escribir `passwordHash`.
3. Agregar middlewares de ownership para `users`, `presentations` y `slides`.
4. Filtrar campos sensibles en respuestas de usuarios.
5. Implementar rate limiting y proteccion CSRF.
6. Hashear tokens persistidos y reducir superficie de almacenamiento.
7. Centralizar validacion de input con esquemas.

## Recomendaciones adicionales

1. Agregar auditoria de acciones sensibles.
2. Definir politicas de complejidad de contrasena.
3. Evitar `console.log` de contenido de entrada en produccion.
4. Evaluar signed URLs o buckets privados para imagenes.
