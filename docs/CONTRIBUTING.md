# Guia de contribucion

## Objetivo

Este documento resume convenciones y practicas recomendadas para extender el backend sin romper el flujo actual.

## Convenciones del proyecto

| Tema | Convencion observada |
| --- | --- |
| Modulos | ESM (`import` / `export`) |
| Estilo | `standard` configurado en `package.json` |
| Nombres de archivo | `feature.type.js`, por ejemplo `login.controller.js` |
| Rutas | `*.routes.js` con instancias `Router()` |
| Controladores | clases exportadas con metodos async |
| Servicios | funciones puras o helpers exportados |
| Modelos | factorias Sequelize por archivo |

## Estructura recomendada

Para nuevas funcionalidades, mantener esta separacion:

1. `routes/` para declarar endpoints.
2. `middleware/` para autenticacion, ownership y validacion reusable.
3. `controllers/` para coordinar request/response.
4. `services/` para logica de negocio e integraciones.
5. `models/` para nuevas entidades y relaciones.
6. `utils/` para helpers realmente compartidos.

## Buenas practicas recomendadas

1. No acceder a APIs externas directamente desde rutas; hacerlo desde servicios.
2. No devolver modelos Sequelize completos si contienen campos sensibles.
3. Usar whitelists al actualizar recursos con `req.body`.
4. Mantener validaciones de entrada cerca del borde HTTP o en middlewares dedicados.
5. Encapsular transacciones en servicios, no en controladores.
6. Agregar pruebas cuando se corrijan bugs o se incorporen endpoints nuevos.

## Naming conventions

| Artefacto | Recomendacion |
| --- | --- |
| Controller | `FeatureController` |
| Route file | `feature.routes.js` |
| Service file | `feature.service.js` |
| Model file | `feature.model.js` |
| Middleware | verbo o regla concreta, por ejemplo `validateOwnership` |

## Flujo recomendado para nuevas features

1. Definir modelo y relaciones si hay persistencia.
2. Crear servicio con logica y dependencias externas.
3. Crear controlador delgado.
4. Crear rutas y middlewares asociados.
5. Documentar el endpoint en `docs/API.md`.
6. Revisar impacto en seguridad y ownership.

## Deuda tecnica que conviene atender al contribuir

| Area | Recomendacion |
| --- | --- |
| Tests | Agregar suite minima para auth, presentations e images |
| Migraciones | Versionar esquema de BD |
| Seguridad | Corregir ownership, reset password y exposure de secretos |
| Observabilidad | Reemplazar `console.log` por logging estructurado |
| Validacion | Unificar con schemas para requests |

## Scripts y verificacion

Scripts disponibles hoy:

- `npm run dev`
- `npm test` placeholder

Recomendacion:

- incorporar `lint`, `test` y eventualmente `start` para produccion.

## Regla practica para cambios sensibles

Si se toca cualquiera de estas areas, documentar el cambio y revisar seguridad:

- autenticacion
- cookies
- modelos `User`, `Presentation`, `Slide`, `SlideElement`, `UserImage`
- servicios con OpenAI, Supabase o Resend
