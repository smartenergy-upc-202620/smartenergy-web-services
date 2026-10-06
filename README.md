# SmartEnergy Web Services

> **Current status:** Initial backend scaffolding prepared for Sprint 1. Only the health endpoint and the domain skeleton exist; the business functionality is **not** implemented yet.

## ¿Qué es SmartEnergy?

SmartEnergy es una plataforma universitaria para el monitoreo y la optimización del consumo energético en hogares y pequeños negocios. Este repositorio contiene su backend: un conjunto de RESTful Web Services pensado como base de una arquitectura de microservicios.

## Stack

TypeScript, NestJS 11, pnpm, PostgreSQL, RESTful APIs, Swagger / OpenAPI, Jest, Docker Compose y Git.

## Arquitectura

Monorepo NestJS con cuatro aplicaciones y dos librerías. El diseño aplica Domain-Driven Design (DDD).

| Aplicación | Puerto | Rol | Bounded Context |
| --- | --- | --- | --- |
| `api-gateway` | 3000 | Punto de entrada único (Facade). Sin lógica de negocio. | — |
| `user-service` | 3001 | Usuarios, autenticación y autorización básica. | Identity & Access |
| `energy-monitoring-service` | 3002 | Mediciones de energía y resúmenes de consumo. | Energy Monitoring |
| `alert-service` | 3003 | Reglas de alerta y alertas. | Alerting |

Reglas principales:

- Las entidades de dominio **no se comparten** entre Bounded Contexts y no existe un Shared Kernel grande.
- `libs/common` (`@app/common`): solo elementos técnicos genéricos (configuración, bootstrap, Swagger, health check).
- `libs/contracts` (`@app/contracts`): contratos de integración entre servicios (DTOs / eventos compartidos). Hoy está vacía a propósito.
- Fuera de alcance por ahora: IoT Gateway / Adapter, Message Broker y Event Processor; MQTT, Kafka, RabbitMQ, IA y dispositivos físicos.

Más detalle en [`docs/architecture.md`](docs/architecture.md).

### Estructura DDD de un Bounded Context

```
apps/<service>/src/
├── domain/            entities, value-objects, repositories (interfaces), services, exceptions
├── application/       use-cases, dto, ports
├── infrastructure/    persistence, repositories (PostgreSQL), configuration, adapters
├── interfaces/http/   controllers, dto, mappers
├── app.module.ts
└── main.ts
```

Las carpetas se crean solo cuando tienen contenido; hoy los servicios de negocio solo tienen `domain/`. Reglas de dependencia:

```
interfaces -> application -> domain
infrastructure implementa los contratos definidos por domain / application
```

`domain` no importa NestJS, Swagger ni ninguna librería de base de datos. Estas reglas se verifican automáticamente en `test/architecture/layer-dependencies.spec.ts`.

## Estructura del monorepo

```
smartenergy-web-services/
├── apps/
│   ├── api-gateway/
│   ├── user-service/
│   ├── energy-monitoring-service/
│   └── alert-service/
├── libs/
│   ├── common/          # @app/common: elementos técnicos genéricos
│   └── contracts/       # @app/contracts: contratos de integración
├── features/            # Especificaciones Gherkin (Sprint 1, planificadas)
├── test/architecture/   # Test de reglas de dependencia DDD
├── postman/             # Colección de Postman
├── docs/                # Documentación
├── .env.example
├── .gitignore
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

## Requisitos

- Node.js 20 o superior
- pnpm (probado con 12.x)
- Docker (para PostgreSQL)

## Instalación

```bash
pnpm install
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
```

## Variables de entorno

Se documentan en [`.env.example`](.env.example). El archivo `.env` real nunca se versiona.

| Variable | Descripción |
| --- | --- |
| `API_GATEWAY_PORT`, `USER_SERVICE_PORT`, `ENERGY_MONITORING_SERVICE_PORT`, `ALERT_SERVICE_PORT` | Puertos HTTP de cada aplicación. |
| `USER_SERVICE_URL`, `ENERGY_MONITORING_SERVICE_URL`, `ALERT_SERVICE_URL` | URLs de los servicios que usará el API Gateway. |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Conexión a PostgreSQL. |

Define `POSTGRES_PASSWORD` en tu `.env` antes de levantar la base de datos; el repositorio no incluye credenciales reales.

## PostgreSQL

```bash
pnpm db:up      # levanta PostgreSQL con Docker Compose
pnpm db:down    # detiene los contenedores
```

Hoy ningún servicio se conecta todavía a la base de datos. En Sprint 1 se espera soportar las tablas `users`, `devices`, `energy_measurements`, `alerts` y `alert_rules`.

## Ejecución

```bash
pnpm start:dev                      # los cuatro servicios en modo watch
pnpm start:dev:api-gateway          # solo uno (user-service, energy-monitoring-service, alert-service)
```

## Build

```bash
pnpm build                          # compila las cuatro aplicaciones en dist/
pnpm start:prod                     # ejecuta el build compilado
```

## Testing

```bash
pnpm test                           # Jest
pnpm test:cov                       # con cobertura
```

Hoy los tests solo cubren el scaffolding: health check de cada aplicación, configuración del gateway, modelo de dominio inicial y reglas de arquitectura. No hay linter configurado todavía.

## Swagger / OpenAPI

Cada aplicación publica su documentación en `http://localhost:<puerto>/docs`.

## Endpoints disponibles hoy

| Aplicación | URL |
| --- | --- |
| API Gateway | `GET http://localhost:3000/api/v1/health` |
| User Service | `GET http://localhost:3001/api/v1/health` |
| Energy Monitoring Service | `GET http://localhost:3002/api/v1/health` |
| Alert Service | `GET http://localhost:3003/api/v1/health` |

## Alcance planificado para Sprint 1 (NO implementado)

- User Service: `POST /auth/register`, `POST /auth/login`, `GET /users/me`.
- Energy Monitoring Service: `POST /measurements`, `GET /measurements`, `GET /measurements/:id`, `GET /measurements/summary`.
- Alert Service: `GET /alerts`, `GET /alerts/:id`, `POST /alert-rules`.

Las especificaciones Gherkin de estas funcionalidades están en [`features/`](features) y están marcadas como `@sprint-1 @planned`.
