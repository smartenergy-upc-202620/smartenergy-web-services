# Architecture

SmartEnergy is a platform for monitoring and optimizing energy consumption in homes and small businesses. This repository contains its backend: a NestJS monorepo of RESTful web services, designed as the base of a microservices architecture and organized with Domain-Driven Design (DDD).

> Current status: initial backend scaffolding prepared for Sprint 1. Only the health endpoint and the domain skeleton exist; no business functionality is implemented yet.

## Services and Bounded Contexts

| Application | Role | Bounded Context |
| --- | --- | --- |
| `apps/api-gateway` | Single entry point of the backend (Facade). No business logic. | None (not a business context) |
| `apps/user-service` | Users, authentication and basic authorization. | Identity & Access |
| `apps/energy-monitoring-service` | Energy measurements and consumption summaries. | Energy Monitoring |
| `apps/alert-service` | Alert rules and alerts. | Alerting |

Rules between contexts:

- Domain entities and value objects are never shared between Bounded Contexts. Each context owns its own model.
- There is no large Shared Kernel. `libs/common` only holds generic technical code (configuration, bootstrap, Swagger setup, health check). `libs/contracts` is reserved for integration contracts (DTOs / events exchanged between services) and is empty until two services really need one.
- Contexts will integrate through the API Gateway and, later, through contracts and events, never by importing each other's code.

## Layers of a Bounded Context

```
apps/<service>/src/
├── domain/            Entities, value objects, repository interfaces, domain services and exceptions
├── application/       Use cases, application DTOs and ports
├── infrastructure/    Persistence (PostgreSQL), repository implementations, configuration, adapters
├── interfaces/http/   Controllers, HTTP DTOs (Swagger) and mappers
├── app.module.ts
└── main.ts
```

Folders are created only when they have content. At this stage only `domain/` exists in the business services.

Dependency rules:

```
interfaces -> application -> domain
infrastructure implements contracts defined by domain / application
```

- `domain` imports nothing but itself: no NestJS, no Swagger, no TypeORM / Prisma / PostgreSQL, no other layers.
- `application` may depend on `domain`, never on `infrastructure` or `interfaces`.
- `interfaces` use `application` and never `infrastructure`.
- `infrastructure` may depend on `domain` / `application` to implement their contracts.

These rules are checked automatically by `test/architecture/layer-dependencies.spec.ts` (run with `pnpm test`).

The API Gateway is intentionally simpler: `infrastructure/` (configuration, later the clients of the downstream services) and `interfaces/` (HTTP entry point), with no domain layer.

## Current domain skeleton

| Context | Domain model |
| --- | --- |
| Identity & Access | `User`, `Email` (value object), `UserRepository` |
| Energy Monitoring | `EnergyMeasurement` (`id`, `deviceId`, `consumptionKwh`, `measuredAt`), `EnergyMeasurementRepository` |
| Alerting | `AlertRule`, `Alert`, `AlertRuleRepository`, `AlertRepository` |

Repository interfaces live in `domain/repositories` together with their injection token; the PostgreSQL implementations will live in `infrastructure/`. The fields of `User`, `AlertRule` and `Alert` are provisional and must be confirmed against the data model before Sprint 1.

## Pattern readiness

| Pattern | Where it will be applied |
| --- | --- |
| Facade | `api-gateway` |
| Repository | Interfaces in `domain/repositories`, PostgreSQL implementations in `infrastructure/repositories` |
| Entity | `domain/entities` |
| Strategy | Alert rule evaluation (Alerting), later |
| Adapter | IoT integration, later |
| Observer / Event-driven | Event processing, later |

None of the later patterns is implemented yet.

## Ports and endpoints

| Application | Port | API base path | Swagger UI |
| --- | --- | --- | --- |
| `api-gateway` | 3000 | `/api/v1` | `/docs` |
| `user-service` | 3001 | `/api/v1` | `/docs` |
| `energy-monitoring-service` | 3002 | `/api/v1` | `/docs` |
| `alert-service` | 3003 | `/api/v1` | `/docs` |

Available today: `GET /api/v1/health` on every application.

## Planned for Sprint 1 (not implemented)

- User Service: `POST /auth/register`, `POST /auth/login`, `GET /users/me`.
- Energy Monitoring Service: `POST /measurements`, `GET /measurements`, `GET /measurements/:id`, `GET /measurements/summary`.
- Alert Service: `GET /alerts`, `GET /alerts/:id`, `POST /alert-rules`.

PostgreSQL tables expected to be supported: `users`, `devices`, `energy_measurements`, `alerts`, `alert_rules`.

## Later iterations

IoT Gateway / Adapter, Message Broker and Event Processor are planned for a later iteration and are intentionally out of scope for now.
