# Autenticacion y autorizacion

## Mecanismo principal

El backend usa JWT con dos cookies HTTP-only:

| Cookie | Uso | Expiracion |
| --- | --- | --- |
| `accessToken` | Acceso a endpoints protegidos | `15m` |
| `refreshToken` | Renovacion de sesion | `7d` |

Las firmas usan:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Flujo de login

1. `POST /api/auth/login` recibe `email` y `password`.
2. Se busca el usuario por email usando `Op.iLike`.
3. Se valida la contrasena con `bcrypt.compare`.
4. Se generan access y refresh tokens.
5. El refresh token se guarda en `User.refreshToken`.
6. Ambos tokens se devuelven como cookies HTTP-only.

## Flujo de autenticacion de requests

1. `authMiddleware` lee `req.cookies.accessToken`.
2. Verifica la firma con `JWT_ACCESS_SECRET`.
3. Si es valido, expone `req.user = { id, email }`.
4. Si falta o expira, responde `401`.

## Flujo de refresh

1. `POST /api/auth/refresh` lee `req.cookies.refreshToken`.
2. Verifica firma con `JWT_REFRESH_SECRET`.
3. Busca al usuario por `decoded.id`.
4. Comprueba que el token coincida con `user.refreshToken`.
5. Emite una nueva cookie `accessToken`.

## Flujo de logout

1. `POST /api/auth/logout` busca al usuario por el refresh token de cookie.
2. Si existe, pone `refreshToken = null`.
3. Limpia cookies `accessToken` y `refreshToken`.

## Recuperacion de contrasena

### Forgot password

1. `POST /api/auth/forgot-password` recibe email.
2. Si existe el usuario:
   - elimina tokens previos de reset;
   - genera token aleatorio con `crypto.randomBytes(32)`;
   - crea `PasswordResetToken` con expiracion de 30 minutos;
   - envia email via Resend con enlace `FRONTEND_URL/reset-password?token=...`.
3. Si el usuario no existe, responde con mensaje generico para no revelar existencia del correo.

### Validacion del token

- `GET /api/auth/validate-reset-token` valida presencia y expiracion.

### Reset password

- `POST /api/auth/reset-password` valida token y, si es valido, intenta actualizar la contrasena.

Observacion critica:

- el codigo actual asigna `user.password = bcrypt.hash(...)` en vez de `user.passwordHash = ...`.
- dado que el modelo `User` no define un campo `password`, este flujo probablemente no actualiza la contrasena real.

## Sesiones

El proyecto no usa almacenamiento de sesiones de servidor como Redis o `express-session`. La sesion es hibrida:

- estado corto en `accessToken`;
- estado de refresco persistido en `User.refreshToken`.

Esto permite invalidar la sesion cerrando o reemplazando el refresh token guardado en base de datos.

## Autorizacion

No existe un sistema formal de roles y permisos. La autorizacion funciona por:

- autenticacion basica via `authMiddleware`;
- validacion de ownership en middlewares especificos.

### Middlewares de autorizacion detectados

| Middleware | Recurso protegido | Regla |
| --- | --- | --- |
| `validateSlideOwnership` | `slide-elements` por `slideId` | la presentacion duena del slide debe pertenecer a `req.user.id` |
| `validateSlideElementOwnership` | `slide-elements/:id` | el elemento debe pertenecer a una presentacion del usuario |
| `validateUserImageOwnership` | `user-images/:id` | la imagen debe tener `userId === req.user.id` |

## Cobertura real de autorizacion

### Bien cubierto

- `slide-elements`
- `user-images`
- `auth/profile`

### Parcial o faltante

- `presentations/:id`: no valida que la presentacion pertenezca al usuario autenticado.
- `slides/*`: autentica, pero no verifica ownership de la presentacion/slide.
- `users/:id`: autentica, pero cualquier usuario autenticado puede consultar, actualizar o eliminar otros usuarios.
- `users/test/deleteTestUser`: es publico.

## Configuracion de cookies

Todas las cookies de auth usan:

- `httpOnly: true`
- `sameSite: 'lax'`
- `secure: true`

Implicaciones:

- en produccion requieren HTTPS;
- `sameSite=lax` reduce algunos riesgos CSRF, pero no sustituye una estrategia CSRF completa;
- en desarrollo local sin HTTPS puede requerir ajustes segun el entorno cliente.

## Tokens y expiracion

| Token | Payload observado | Expiracion |
| --- | --- | --- |
| Access token | `{ id, email }` | 15 minutos |
| Refresh token | `{ id }` | 7 dias |
| Password reset token | string aleatorio en BD | 30 minutos |

## Refresh tokens

Si existen. Detalles observados:

- se almacenan en la tabla `User`;
- solo se conserva uno por usuario;
- se comparan en texto plano;
- no hay rotacion formal del refresh token en cada refresh.

## Mejoras recomendadas

1. Corregir `reset-password` para actualizar `passwordHash`.
2. Hashear `refreshToken` y `PasswordResetToken.token` antes de persistirlos.
3. Agregar ownership checks para `users`, `presentations` y `slides`.
4. Incorporar proteccion CSRF para operaciones state-changing basadas en cookies.
5. Agregar rate limiting a `login`, `forgot-password` y `refresh`.
