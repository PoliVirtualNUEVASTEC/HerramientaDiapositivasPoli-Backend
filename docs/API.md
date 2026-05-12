# API REST

## Convenciones generales

- Base path: `/api`
- Formato principal: `application/json`
- Uploads: `multipart/form-data`
- Autenticacion: cookies HTTP-only, no header `Authorization`
- Endpoints protegidos: requieren cookie `accessToken`
- Renovacion de sesion: requiere cookie `refreshToken`

## Headers y comportamiento comun

| Caso | Headers / requisitos |
| --- | --- |
| JSON | `Content-Type: application/json` |
| PDF | `Content-Type: multipart/form-data` con campo `file` |
| Imagenes | `Content-Type: multipart/form-data` con una imagen |
| Cookies cross-site | El cliente debe enviar credenciales (`credentials: include`) |

## Endpoints de usuarios

### POST `/api/users/`

- Descripcion: registra un usuario.
- Auth: publica.
- Body:

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Secret123!"
}
```

- Respuesta `201`:

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com"
}
```

- Respuestas posibles:
  - `201` usuario creado.
  - `409` usuario ya existe.
  - `500` error creando usuario.

### GET `/api/users/`

- Descripcion: lista todos los usuarios.
- Auth: `accessToken`.
- Parametros: ninguno.
- Respuesta `200`: arreglo de modelos `User` completos.
- Riesgo funcional: expone campos como `passwordHash` y `refreshToken` segun el modelo actual.
- Respuestas posibles:
  - `200` listado.
  - `401` no autenticado.
  - `500` error de consulta.

### GET `/api/users/:id`

- Descripcion: obtiene un usuario por id.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuesta `200`: objeto `User`.
- Respuestas posibles:
  - `200` encontrado.
  - `401` no autenticado.
  - `404` `{"error":"User not found"}`
  - `500` error interno.

### PUT `/api/users/:id`

- Descripcion: actualiza un usuario por id.
- Auth: `accessToken`.
- Params: `id` entero.
- Body: cualquier campo enviado en `req.body` se pasa a `user.update(req.body)`.
- Ejemplo:

```json
{
  "fullName": "Ada Byron"
}
```

- Respuestas posibles:
  - `200` usuario actualizado.
  - `401` no autenticado.
  - `404` usuario no encontrado.
  - `500` error interno.

### DELETE `/api/users/:id`

- Descripcion: elimina un usuario por id.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuestas posibles:
  - `204` eliminado.
  - `401` no autenticado.
  - `404` usuario no encontrado.
  - `500` error interno.

### DELETE `/api/users/test/deleteTestUser`

- Descripcion: elimina un usuario fijo con email `juan_perez_test@elpoli.edu.co`.
- Auth: publica.
- Respuestas posibles:
  - `204` eliminado.
  - `404` usuario no encontrado.
  - `500` error interno.

## Endpoints de autenticacion

### POST `/api/auth/login`

- Descripcion: autentica credenciales y emite cookies de sesion.
- Auth: publica.
- Body:

```json
{
  "email": "ada@example.com",
  "password": "Secret123!"
}
```

- Respuesta `200`:

```json
{
  "message": "Login exitoso"
}
```

- Cookies emitidas:
  - `accessToken`, expira en 15 minutos.
  - `refreshToken`, expira en 7 dias.

- Respuestas posibles:
  - `200` login exitoso.
  - `401` `Usuario no encontrado` o `Password incorrecto`.

### POST `/api/auth/refresh`

- Descripcion: renueva el access token usando el refresh token guardado en cookie.
- Auth: requiere cookie `refreshToken`.
- Body: vacio.
- Respuesta `200`:

```json
{
  "message": "Token renovado"
}
```

- Respuestas posibles:
  - `200` token renovado.
  - `403` `No autorizado`.
  - `403` `Refresh token invalido`.
  - `403` `Refresh token expirado`.

### POST `/api/auth/logout`

- Descripcion: invalida el refresh token persistido y limpia cookies.
- Auth: depende de cookie `refreshToken`; no usa `authMiddleware`.
- Body: vacio.
- Respuesta `200`:

```json
{
  "message": "Logout exitoso"
}
```

### GET `/api/auth/profile`

- Descripcion: devuelve perfil basico del usuario autenticado.
- Auth: `accessToken`.
- Respuesta `200`:

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com"
}
```

- Respuestas posibles:
  - `200` perfil.
  - `401` token faltante o expirado.
  - `404` usuario no encontrado.
  - `500` error consultando usuario.

### POST `/api/auth/forgot-password`

- Descripcion: genera token temporal y envia correo de recuperacion con Resend.
- Auth: publica.
- Body:

```json
{
  "email": "ada@example.com"
}
```

- Respuesta `200` si el correo existe o no:

```json
{
  "message": "Si el correo existe, se enviara un link"
}
```

o

```json
{
  "message": "Correo enviado"
}
```

- Respuestas posibles:
  - `200` respuesta generica o correo enviado.
  - `500` error enviando email o consultando usuario.

### GET `/api/auth/validate-reset-token?token=...`

- Descripcion: valida existencia y expiracion del token de recuperacion.
- Auth: publica.
- Query params: `token`.
- Respuesta `200`:

```json
{
  "valid": true
}
```

- Respuestas posibles:
  - `200` token valido.
  - `400` `{"valid":false}`
  - `400` `{"valid":false,"message":"Token expirado"}`

### POST `/api/auth/reset-password`

- Descripcion: intenta actualizar la contrasena a partir de un token valido.
- Auth: publica.
- Body:

```json
{
  "token": "hex-token",
  "newPassword": "NewSecret123!"
}
```

- Respuesta `200`:

```json
{
  "message": "Contrasena actualizada"
}
```

- Respuestas posibles:
  - `200` respuesta de exito.
  - `400` token invalido o expirado.

- Nota tecnica: el controlador actual asigna `user.password` en vez de `user.passwordHash`, por lo que este flujo requiere correccion.

## Endpoints de presentaciones

### POST `/api/presentations/pdf`

- Descripcion: genera una presentacion a partir de un PDF.
- Auth: `accessToken`.
- Content type: `multipart/form-data`.
- Campos:
  - `file`: PDF obligatorio.
  - `numberOfSlides`: opcional.
- Respuesta `201`:

```json
{
  "message": "Presentacion creada correctamente",
  "presentationId": 12,
  "title": "Introduccion a la IA",
  "createdAt": "2026-05-12T16:00:00.000Z"
}
```

- Respuestas posibles:
  - `201` creada.
  - `400` sin archivo, PDF invalido o sin texto extraible.
  - `401` no autenticado.
  - `500` error generando o guardando.

### POST `/api/presentations/text`

- Descripcion: genera una presentacion desde texto libre.
- Auth: `accessToken`.
- Body:

```json
{
  "text": "Texto base de la presentacion",
  "numberOfSlides": 6
}
```

- Respuestas posibles:
  - `201` creada.
  - `400` texto ausente, vacio o demasiado largo.
  - `401` no autenticado.
  - `500` error generando o guardando.

### GET `/api/presentations/:id`

- Descripcion: devuelve una presentacion formateada con sus diapositivas y elementos.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuesta `200`:

```json
{
  "id": 12,
  "title": "Introduccion a la IA",
  "description": "Presentacion generada automaticamente",
  "theme": {
    "background": "#ffffff",
    "fontFamily": "Arial",
    "primaryColor": "#4f46e5"
  },
  "slides": []
}
```

- Respuestas posibles:
  - `200` encontrada.
  - `401` no autenticado.
  - `404` presentacion no encontrada.

### GET `/api/presentations/`

- Descripcion: lista las presentaciones del usuario autenticado.
- Auth: `accessToken`.
- Respuesta `200`: arreglo con `id`, `title`, `description`, `createdAt`, `slidesCount`, `firstSlide`.
- Respuestas posibles:
  - `200` listado.
  - `401` no autenticado.
  - `404` si no hay presentaciones para el usuario.

### DELETE `/api/presentations/:id`

- Descripcion: elimina una presentacion por id.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuestas posibles:
  - `204` eliminada.
  - `401` no autenticado.
  - `404` no encontrada.
  - `500` error interno.

## Endpoints de diapositivas

### GET `/api/slides/:presentationId`

- Descripcion: lista las diapositivas de una presentacion con sus elementos.
- Auth: `accessToken`.
- Params: `presentationId` entero.
- Respuesta `200`: arreglo de `Slide` con include `SlideElements`.
- Respuestas posibles:
  - `200` listado.
  - `401` no autenticado.
  - `500` error interno.

### GET `/api/slides/slide/:id`

- Descripcion: obtiene una diapositiva por id.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuestas posibles:
  - `200` encontrada.
  - `401` no autenticado.
  - `404` `Slide not found`.
  - `500` error interno.

### POST `/api/slides/`

- Descripcion: crea una diapositiva y reordena si es necesario.
- Auth: `accessToken`.
- Body:

```json
{
  "presentationId": 12,
  "title": "Nueva diapositiva",
  "slideOrder": 2,
  "background": {
    "type": "image",
    "url": "https://example.com/bg.jpg"
  }
}
```

- Respuestas posibles:
  - `201` diapositiva creada.
  - `400` `presentationId is required`.
  - `401` no autenticado.
  - `500` error interno.

### PUT `/api/slides/:id`

- Descripcion: actualiza titulo, orden y/o fondo de una diapositiva.
- Auth: `accessToken`.
- Params: `id` entero.
- Body: cualquiera de `title`, `slideOrder`, `background`.
- Respuestas posibles:
  - `200` actualizada.
  - `401` no autenticado.
  - `404` `Slide not found`.
  - `500` error interno.

### DELETE `/api/slides/:id`

- Descripcion: elimina una diapositiva y compacta el orden restante.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuestas posibles:
  - `204` eliminada.
  - `401` no autenticado.
  - `404` no encontrada.
  - `500` error interno.

### POST `/api/slides/:id/duplicate`

- Descripcion: duplica una diapositiva junto con sus elementos.
- Auth: `accessToken`.
- Params: `id` entero.
- Respuesta `201`: nueva diapositiva con include `SlideElements`.
- Respuestas posibles:
  - `201` duplicada.
  - `401` no autenticado.
  - `404` `Slide not found`.
  - `500` error al duplicar.

## Endpoints de elementos de diapositiva

### POST `/api/slide-elements/`

- Descripcion: crea un elemento dentro de una diapositiva.
- Auth: `accessToken` + ownership de la diapositiva.
- Body:

```json
{
  "slideId": 10,
  "type": "text",
  "content": {
    "text": "Contenido de ejemplo"
  },
  "positionX": 60,
  "positionY": 120,
  "width": 400,
  "height": 120,
  "styles": {
    "fontSize": 20
  },
  "order": 1
}
```

- Respuestas posibles:
  - `201` creado.
  - `400` `slideId es obligatorio` o payload invalido.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` slide/presentacion no encontrados.
  - `500` error interno.

### GET `/api/slide-elements/slide/:slideId`

- Descripcion: lista elementos por diapositiva.
- Auth: `accessToken` + ownership de la diapositiva.
- Params: `slideId` entero.
- Respuestas posibles:
  - `200` listado ordenado por `order`.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` recursos asociados no encontrados.
  - `500` error interno.

### GET `/api/slide-elements/:id`

- Descripcion: obtiene un elemento por id.
- Auth: `accessToken` + ownership del elemento.
- Params: `id` entero.
- Respuestas posibles:
  - `200` encontrado.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` elemento/slide/presentacion no encontrados.

### PUT `/api/slide-elements/:id`

- Descripcion: actualiza tipo, contenido, posicion, tamano, estilos y orden.
- Auth: `accessToken` + ownership del elemento.
- Params: `id` entero.
- Body: parcial.
- Respuestas posibles:
  - `200` actualizado.
  - `400` payload invalido.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` elemento/slide/presentacion no encontrados.
  - `500` error interno.

### DELETE `/api/slide-elements/:id`

- Descripcion: elimina un elemento de diapositiva.
- Auth: `accessToken` + ownership del elemento.
- Params: `id` entero.
- Respuestas posibles:
  - `204` eliminado.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` elemento/slide/presentacion no encontrados.
  - `500` error interno.

## Endpoints de imagenes de usuario

### POST `/api/user-images/`

- Descripcion: sube, optimiza y registra una imagen del usuario.
- Auth: `accessToken`.
- Content type: `multipart/form-data`.
- Archivo: una sola imagen, cualquier MIME `image/*`.
- Respuesta `201`:

```json
{
  "message": "Imagen subida correctamente",
  "image": {
    "id": 4,
    "userId": 2,
    "url": "https://project.supabase.co/storage/v1/object/public/user-images/users/2/xxx.webp",
    "path": "users/2/xxx.webp",
    "contentHash": "abc123",
    "lastAccessedAt": "2026-05-12T16:00:00.000Z"
  },
  "optimizedBytes": 143220,
  "policy": {
    "maxImagesPerUser": 50,
    "deletedStaleImages": 0,
    "deletedOverflowImages": 0
  }
}
```

- Respuestas posibles:
  - `201` subida exitosa.
  - `400` sin imagen, archivo invalido o excede tamano.
  - `401` no autenticado.
  - `409` imagen duplicada para el mismo usuario.
  - `500` error en upload o persistencia.

### GET `/api/user-images/`

- Descripcion: lista las imagenes del usuario y limpia expiradas antes de responder.
- Auth: `accessToken`.
- Respuesta `200`: arreglo de `UserImage`.
- Respuestas posibles:
  - `200` listado.
  - `401` no autenticado.
  - `500` error interno.

### POST `/api/user-images/:id/access`

- Descripcion: actualiza `lastAccessedAt` de una imagen.
- Auth: `accessToken` + ownership de la imagen.
- Params: `id` entero.
- Respuestas posibles:
  - `200` imagen actualizada.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` imagen no encontrada.
  - `500` error interno.

### DELETE `/api/user-images/:id`

- Descripcion: elimina una imagen tanto en Supabase Storage como en la tabla `user_images`.
- Auth: `accessToken` + ownership de la imagen.
- Params: `id` entero.
- Respuestas posibles:
  - `204` eliminada.
  - `401` no autenticado.
  - `403` sin permiso.
  - `404` imagen no encontrada.
  - `500` error interno.

## Observaciones funcionales importantes

- No se detectaron endpoints GraphQL.
- Los endpoints protegidos usan cookies, por lo que clientes no browser deben reenviarlas manualmente.
- `presentations`, `slides` y `users` no aplican ownership fino en todos sus endpoints; autentican, pero no siempre restringen acceso al recurso correcto.
