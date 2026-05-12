# Resumen tecnico del backend

## Stack y alcance

El backend es una API REST en Express 5 con Sequelize sobre PostgreSQL. Atiende autenticacion de usuarios, recuperacion de contrasena, generacion de presentaciones con OpenAI, enriquecimiento de imagenes con Pexels y manejo de imagenes de usuario en Supabase Storage.

## Arquitectura resumida

- monolito modular por capas;
- rutas y middlewares en Express;
- controladores como orquestadores HTTP;
- servicios para IA, imagenes y persistencia compuesta;
- modelos Sequelize sin migraciones versionadas.

## Capacidades funcionales implementadas

| Dominio | Estado |
| --- | --- |
| Registro y login | Implementado |
| Refresh/logout | Implementado |
| Recuperacion de contrasena | Implementado con bug en persistencia final |
| Presentaciones desde texto | Implementado |
| Presentaciones desde PDF | Implementado |
| CRUD de slides | Implementado |
| CRUD de slide elements | Implementado |
| Upload de imagenes de usuario | Implementado |
| Roles y permisos | No detectados |
| Tests automatizados | No detectados |

## Fortalezas tecnicas

1. La generacion de presentaciones esta razonablemente desacoplada en servicios.
2. El uso de JSON schema con OpenAI reduce respuestas ambiguas.
3. La persistencia de una presentacion completa usa transacciones.
4. El pipeline de imagenes incorpora optimizacion, deduplicacion y limpieza.

## Deuda tecnica principal

1. No hay migraciones ni estrategia formal de evolucion del esquema.
2. No hay tests automatizados.
3. Hay logging de depuracion en runtime.
4. Existen plantillas JSON aparentemente no usadas.
5. El script `test` es solo placeholder y no hay script `start`.

## Riesgos prioritarios

1. Secretos presentes en `.env` del workspace.
2. Ownership incompleto en endpoints de `users`, `presentations` y `slides`.
3. `reset-password` actualiza un campo incorrecto (`password` en vez de `passwordHash`).
4. Los endpoints de usuarios pueden exponer `passwordHash` y `refreshToken`.
5. No hay rate limiting ni proteccion CSRF dedicada.

## Mejoras arquitectonicas sugeridas

1. Incorporar validacion de requests por esquema.
2. Crear una capa de autorizacion consistente para todos los recursos.
3. Versionar el esquema con migraciones.
4. Agregar logging estructurado y manejo centralizado de errores.
5. Preparar jobs asincronos para tareas pesadas y mantenimiento.

## Estado general

El backend cumple bien como MVP funcional para generacion y administracion de presentaciones, pero necesita endurecimiento en seguridad, operacion y mantenibilidad antes de considerarse listo para produccion exigente.
