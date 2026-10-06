# SmartEnergy Web Services

> **Estado:** Sprint 1 implementado. Registro y autenticación de usuarios, mediciones energéticas con resumen de consumo, reglas de alerta con evaluación de consumo y un API Gateway como punto de entrada único. Detalle en [`docs/sprint-1.md`](docs/sprint-1.md).

## ¿Qué es SmartEnergy?

SmartEnergy es una plataforma para el monitoreo y la optimización del consumo energético en hogares urbanos y pequeños negocios. Este repositorio contiene su backend: un conjunto de RESTful Web Services organizados como microservicios y diseñados con Domain-Driven Design (DDD).

## Stack

| Área | Tecnología |
| --- | --- |
| Lenguaje / framework | TypeScript 5.9, NestJS 11 |
| Gestor de paquetes | pnpm |
| Base de datos | PostgreSQL 17 (Docker Compose) |
| ORM | TypeORM (solo en la capa `infrastructure`) |
| Autenticación | JWT (`@nestjs/jwt`) + hash de contraseñas con bcrypt (`bcryptjs`) |
| Validación | class-validator, class-transformer |
| Documentación API | Swagger / OpenAPI (`@nestjs/swagger`) |
| Pruebas | Jest, especificaciones BDD en Gherkin, colección Postman |

## Arquitectura

Monorepo NestJS con cuatro aplicaciones y dos librerías.

| Aplicación | Puerto | Rol | Bounded Context | Schema PostgreSQL |
| --- | --- | --- | --- | --- |
| `api-gateway` | 3000 | Punto de entrada único (Facade). Solo enruta, sin lógica de negocio. | — | — |
| `user-service` | 3001 | Registro, login (JWT) y perfil del usuario autenticado. | Identity & Access | `identity_access` |
| `energy-monitoring-service` | 3002 | Mediciones de energía y resumen de consumo. | Energy Monitoring | `energy_monitoring` |
| `alert-service` | 3003 | Reglas de alerta, evaluación de consumo y alertas. | Alerting | `alerting` |

```
Cliente / Postman
       │  http://localhost:3000/api/v1/...
       ▼
┌──────────────┐   /auth/*, /users/*          ┌──────────────────────────┐
│ API Gateway  │ ───────────────────────────► │ user-service :3001       │──► identity_access
│ (Facade)     │   /measurements/*            ├──────────────────────────┤
│              │ ───────────────────────────► │ energy-monitoring :3002  │──► energy_monitoring
│              │   /alert-rules/*, /alerts/*  ├──────────────────────────┤
│              │ ───────────────────────────► │ alert-service :3003      │──► alerting
└──────────────┘                              └──────────────────────────┘
                                                 una instancia PostgreSQL
```

Reglas principales:

- Cada Bounded Context es dueño de su modelo y de su schema. Ningún servicio importa código de otro ni consulta tablas de otro schema.
- No hay Shared Kernel. `libs/common` (`@app/common`) solo contiene utilidades técnicas genéricas (bootstrap, configuración, health check, conexión TypeORM por schema, filtro de errores HTTP). `libs/contracts` sigue vacía: en Sprint 1 ningún servicio llama a otro.
- El API Gateway no valida ni transforma datos de negocio: reenvía método, ruta, query string, body y header `Authorization`, y devuelve el status code y el body del servicio.

Más detalle en [`docs/architecture.md`](docs/architecture.md) y patrones en [`docs/patterns.md`](docs/patterns.md).

### Capas DDD de cada Bounded Context

```
apps/<service>/src/
├── domain/            entidades, value objects, contratos de repositorio, servicios de dominio, excepciones
├── application/       casos de uso, ports (PasswordHasher, TokenService), excepciones de aplicación
├── infrastructure/    TypeORM (ORM entities, mappers, repositorios), adaptadores (bcrypt, JWT)
├── interfaces/http/   controllers, DTOs HTTP (validación + Swagger), guards, mapeo de errores → HTTP
├── app.module.ts      composition root (inyección de dependencias)
└── main.ts
```

```
interfaces -> application -> domain
infrastructure implementa los contratos definidos por domain / application
```

`domain` no importa NestJS, TypeORM, PostgreSQL ni Swagger. TypeORM solo aparece en `infrastructure`. Estas reglas se verifican automáticamente en [`test/architecture/layer-dependencies.spec.ts`](test/architecture/layer-dependencies.spec.ts).

## Estructura del monorepo

```
smartenergy-web-services/
├── apps/
│   ├── api-gateway/                 # Facade: rutas documentadas + proxy HTTP
│   ├── user-service/                # Identity & Access
│   ├── energy-monitoring-service/   # Energy Monitoring
│   └── alert-service/               # Alerting
├── libs/
│   ├── common/                      # @app/common: utilidades técnicas genéricas
│   └── contracts/                   # @app/contracts: contratos de integración (vacía en Sprint 1)
├── features/                        # Especificaciones BDD (Gherkin)
├── postman/                         # Colección + environment local
├── scripts/demo-seed.mjs            # Datos de demostración vía API Gateway
├── test/
│   ├── architecture/                # Reglas de dependencia DDD
│   └── support/                     # Helpers de pruebas HTTP
├── docs/                            # Documentación
├── .env.example
├── docker-compose.yml
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Requisitos

- Node.js 20.19+ (probado con 22.20)
- pnpm (probado con 12.5)
- Docker con Docker Compose (para PostgreSQL)

## Instalación

```bash
pnpm install
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
```

Edita `.env` y define al menos `POSTGRES_PASSWORD` y `JWT_SECRET` (valor largo y aleatorio):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Variables de entorno

Documentadas en [`.env.example`](.env.example). El archivo `.env` real nunca se versiona.

| Variable | Usada por | Descripción |
| --- | --- | --- |
| `API_GATEWAY_PORT`, `USER_SERVICE_PORT`, `ENERGY_MONITORING_SERVICE_PORT`, `ALERT_SERVICE_PORT` | cada app | Puertos HTTP (3000–3003 por defecto). |
| `USER_SERVICE_URL`, `ENERGY_SERVICE_URL`, `ALERT_SERVICE_URL` | api-gateway | URLs de los servicios a los que enruta el gateway. |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | servicios de negocio, Docker Compose | Conexión a PostgreSQL. |
| `DB_SYNCHRONIZE` | servicios de negocio | `true` (por defecto) crea el schema propio y sincroniza las tablas. Siempre desactivado con `NODE_ENV=production`. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | user-service | Firma y duración (`1h` por defecto) del access token. `JWT_SECRET` es obligatorio. |

## PostgreSQL

Una sola instancia para desarrollo; los datos se separan por schema, uno por Bounded Context.

| Schema | Tablas (Sprint 1) | Dueño |
| --- | --- | --- |
| `identity_access` | `users` | user-service |
| `energy_monitoring` | `energy_measurements` | energy-monitoring-service |
| `alerting` | `alert_rules`, `alerts` (FK `alerts.rule_id → alert_rules.id`) | alert-service |

```bash
docker compose up -d     # o: pnpm db:up
docker compose ps        # el contenedor smartenergy-postgres debe estar "healthy"
pnpm db:down             # detener
```

Al arrancar con `DB_SYNCHRONIZE=true`, cada servicio crea su schema (`CREATE SCHEMA IF NOT EXISTS`) y sus tablas mediante TypeORM. Las migraciones versionadas quedan como pendiente para entornos no locales.

## Ejecución

```bash
pnpm start:dev:all                          # los cuatro servicios en modo watch (alias: pnpm start:dev)
pnpm start:dev:api-gateway                  # o cada uno por separado
pnpm start:dev:user-service
pnpm start:dev:energy-monitoring-service
pnpm start:dev:alert-service
```

Build y ejecución compilada:

```bash
pnpm build
pnpm start:prod
```

## Datos de demostración

Con los cuatro servicios levantados:

```bash
pnpm demo:seed
```

El script [`scripts/demo-seed.mjs`](scripts/demo-seed.mjs) usa **solo el API Gateway** (no escribe en la base de datos directamente): registra `demo@example.com` / `DemoPassword123`, crea cinco mediciones, la regla "High consumption" (5 kWh) y evalúa un consumo de 8.2 kWh. Es idempotente para el usuario y la regla. Nunca se ejecuta automáticamente; no usarlo contra producción.

## Testing

```bash
pnpm test        # Jest: unitarias, HTTP y reglas de arquitectura
pnpm test:cov    # con cobertura (reporte en coverage/)
```

Los tests no requieren PostgreSQL ni servicios levantados. Resumen en [`docs/testing.md`](docs/testing.md). No hay linter configurado.

## Swagger / OpenAPI

| Aplicación | Swagger UI | OpenAPI JSON |
| --- | --- | --- |
| API Gateway | http://localhost:3000/docs | http://localhost:3000/docs-json |
| User Service | http://localhost:3001/docs | http://localhost:3001/docs-json |
| Energy Monitoring Service | http://localhost:3002/docs | http://localhost:3002/docs-json |
| Alert Service | http://localhost:3003/docs | http://localhost:3003/docs-json |

`GET /users/me` usa el esquema Bearer: pulsa **Authorize** y pega el `accessToken` del login.

## Postman

1. Importa [`postman/SmartEnergy.postman_collection.json`](postman/SmartEnergy.postman_collection.json) y [`postman/SmartEnergy.local.postman_environment.json`](postman/SmartEnergy.local.postman_environment.json).
2. Selecciona el environment **SmartEnergy Local**.
3. Ejecuta la colección en orden: Health → Authentication → Energy Measurements → Alert Rules → Alerts.

Los scripts guardan `accessToken`, `measurementId`, `alertRuleId` y `alertId`. El registro genera un email nuevo en cada ejecución, así que la colección se puede repetir.

## Endpoints

Todas las rutas tienen el prefijo `/api/v1`. El cliente usa el API Gateway (`http://localhost:3000`).

| Método | Ruta | Servicio | Auth | Descripción |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | user | — | Registrar usuario (`HOME_USER` o `BUSINESS_ADMIN`). 201 / 400 / 409 |
| POST | `/auth/login` | user | — | Login, devuelve `accessToken` + usuario. 200 / 400 / 401 |
| GET | `/users/me` | user | Bearer | Perfil del usuario autenticado. 200 / 401 |
| POST | `/measurements` | energy | — | Registrar medición (ID generado en backend). 201 / 400 |
| GET | `/measurements?deviceId=` | energy | — | Listar mediciones (más recientes primero), filtro opcional por dispositivo. 200 |
| GET | `/measurements/summary?deviceId=` | energy | — | Total de mediciones, consumo total y promedio. 200 |
| GET | `/measurements/:id` | energy | — | Medición por id (UUID). 200 / 400 / 404 |
| POST | `/alert-rules` | alert | — | Crear regla de umbral. 201 / 400 |
| GET | `/alert-rules` | alert | — | Listar reglas. 200 |
| POST | `/alerts/evaluate` | alert | — | Evaluar un consumo contra las reglas activas y crear alertas. 200 / 400 |
| GET | `/alerts` | alert | — | Listar alertas (más recientes primero). 200 |
| GET | `/alerts/:id` | alert | — | Alerta por id (UUID). 200 / 400 / 404 |
| GET | `/health` | cada app | — | Health check propio. |
| GET | `/system/health` | gateway | — | Estado de los tres servicios (200 o 503). |

Todas las respuestas de error tienen el mismo formato:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Alert \"00000000-0000-4000-8000-000000000000\" was not found",
  "path": "/api/v1/alerts/00000000-0000-4000-8000-000000000000",
  "timestamp": "2026-10-06T10:31:00.000Z"
}
```

Los errores inesperados devuelven `500` con el mensaje `Internal server error`, sin stack trace.

### Ejemplo de flujo

```bash
G=http://localhost:3000/api/v1

curl -X POST $G/auth/register -H 'content-type: application/json' \
  -d '{"email":"user@example.com","password":"StrongPassword123","role":"HOME_USER"}'

TOKEN=$(curl -s -X POST $G/auth/login -H 'content-type: application/json' \
  -d '{"email":"user@example.com","password":"StrongPassword123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).accessToken")

curl $G/users/me -H "Authorization: Bearer $TOKEN"

curl -X POST $G/measurements -H 'content-type: application/json' \
  -d '{"deviceId":"device-001","consumptionKwh":3.75,"measuredAt":"2026-10-06T10:30:00.000Z"}'
curl $G/measurements/summary

curl -X POST $G/alert-rules -H 'content-type: application/json' -d '{"name":"High consumption","thresholdKwh":5.0}'
curl -X POST $G/alerts/evaluate -H 'content-type: application/json' -d '{"deviceId":"device-001","consumptionKwh":8.2}'
curl $G/alerts
```

## Docker

`docker-compose.yml` levanta solo PostgreSQL 17 con health check (`pg_isready`) y un volumen persistente. Las cuatro aplicaciones se ejecutan localmente con pnpm; contenerizarlas queda fuera de Sprint 1.

## Fuera de alcance (Sprint 1)

IoT Gateway, MQTT, Message Broker (RabbitMQ / Kafka), Event Processor, integración event-driven (Observer), sensores físicos, machine learning, predicción, recomendaciones, frontend, pagos, suscripciones y despliegue en la nube.

## Documentación

- [`docs/architecture.md`](docs/architecture.md): arquitectura, capas y reglas de dependencia.
- [`docs/sprint-1.md`](docs/sprint-1.md): qué se entregó en Sprint 1.
- [`docs/patterns.md`](docs/patterns.md): dónde están Facade, Repository, Entity y Strategy.
- [`docs/testing.md`](docs/testing.md): pruebas automatizadas y BDD.
- [`docs/refactoring-report.md`](docs/refactoring-report.md): del scaffolding inicial a la implementación de Sprint 1.
