# Architecture

SmartEnergy is a platform for monitoring and optimizing energy consumption in urban homes and small businesses. This repository contains its backend: a NestJS monorepo of RESTful web services, organized as microservices and designed with Domain-Driven Design (DDD).

> Current status: Sprint 1 implemented (see [`sprint-1.md`](sprint-1.md)).

## Services and Bounded Contexts

| Application | Port | Role | Bounded Context | PostgreSQL schema |
| --- | --- | --- | --- | --- |
| `apps/api-gateway` | 3000 | Single entry point (Facade). Routes requests, no business logic. | None | None |
| `apps/user-service` | 3001 | Registration, login (JWT), authenticated user profile. | Identity & Access | `identity_access` |
| `apps/energy-monitoring-service` | 3002 | Energy measurements and consumption summary. | Energy Monitoring | `energy_monitoring` |
| `apps/alert-service` | 3003 | Alert rules, consumption evaluation and alerts. | Alerting | `alerting` |

```
client ──► api-gateway :3000 ──┬──► user-service :3001 ──────────────► schema identity_access
                               ├──► energy-monitoring-service :3002 ──► schema energy_monitoring
                               └──► alert-service :3003 ─────────────► schema alerting
                                                 (one PostgreSQL instance)
```

Rules between contexts:

- Each context owns its model and its schema. Domain entities and value objects are never shared, and no service reads another context's tables.
- No service imports code from another application (checked by the architecture test, including the gateway).
- There is no Shared Kernel. `libs/common` holds generic technical code only. `libs/contracts` is still empty: in Sprint 1 no service calls another one (the client triggers the alert evaluation explicitly), so there is no integration contract to share yet.

## Layers of a Bounded Context

```
apps/<service>/src/
├── domain/            Entities, value objects, repository interfaces (+ DI tokens), domain services, exceptions
├── application/       Use cases, ports (interfaces for technical services), application exceptions
├── infrastructure/    persistence/typeorm/{entities,mappers,repositories}, security adapters
├── interfaces/http/   Controllers, HTTP DTOs (class-validator + Swagger), guards, error → status map
├── app.module.ts      Composition root: binds every contract to its implementation
└── main.ts            Bootstrap through @app/common
```

Dependency rules:

```
interfaces -> application -> domain
infrastructure implements contracts defined by domain / application
```

- `domain` imports nothing but itself: no NestJS, Swagger, TypeORM, PostgreSQL, nor other layers. Identity tokens for DI are plain `Symbol`s.
- `application` depends on `domain` and on its own ports. It uses NestJS only for dependency injection decorators (`@Injectable`, `@Inject`), never infrastructure libraries (bcrypt, JWT, TypeORM).
- `interfaces` use `application` (and read-only `domain` types for mapping) and never `infrastructure`.
- `infrastructure` implements `domain` repositories and `application` ports.
- TypeORM (`typeorm`, `@nestjs/typeorm`) only appears in `infrastructure` and in the composition root.

All of these are enforced by `test/architecture/layer-dependencies.spec.ts`.

### Persistence model vs. domain model

TypeORM decorators live only on persistence classes (`*.orm-entity.ts`). Mappers translate between them and the domain entities, which keep their invariants (`EnergyMeasurement.create`, `AlertRule.create`, `new User(...)`). Reading a row goes through the same validation as creating an entity.

| Context | Domain entity | ORM entity | Mapper | Repository contract → implementation |
| --- | --- | --- | --- | --- |
| Identity & Access | `User` (+ `Email`, `UserRole`) | `UserOrmEntity` | `UserMapper` | `UserRepository` → `TypeOrmUserRepository` |
| Energy Monitoring | `EnergyMeasurement` | `EnergyMeasurementOrmEntity` | `EnergyMeasurementMapper` | `EnergyMeasurementRepository` → `TypeOrmEnergyMeasurementRepository` |
| Alerting | `AlertRule`, `Alert` | `AlertRuleOrmEntity`, `AlertOrmEntity` | `AlertRuleMapper`, `AlertMapper` | `AlertRuleRepository` → `TypeOrmAlertRuleRepository`, `AlertRepository` → `TypeOrmAlertRepository` |

### Database

- One PostgreSQL instance (`docker-compose.yml`), one schema per Bounded Context.
- `libs/common` exposes `postgresTypeOrmModule(schema, entities)`, which connects a service with `schema` as its default. The connection comes from `DATABASE_URL` (cloud) or `POSTGRES_*`, with optional TLS (`DB_SSL`); in production it must be fully configured.
- Schemas and tables are created by versioned TypeORM migrations, one migration DataSource per Bounded Context in `infrastructure/persistence/typeorm/` (`<context>.data-source.ts`, `migrations/`, `migrate.ts`). The schema name and ORM entity list live in `<context>.persistence.ts`, shared by the app module and its migrations. Each context keeps its migration history in `<schema>.migrations`. See [`deployment.md`](deployment.md#database-migrations).
- `synchronize` is never used in production. Outside production it is an opt-in shortcut (`DB_SYNCHRONIZE=true`) for throwaway databases; the service then creates its own schema first, because TypeORM does not create schemas by itself.
- Ids are UUID v4 generated in the application layer (`crypto.randomUUID`). Invalid ids in routes are rejected with 400 (`ParseUUIDPipe`) before reaching the database.
- Tables: `identity_access.users` (unique `email`), `energy_monitoring.energy_measurements` (index on `device_id`), `alerting.alert_rules`, `alerting.alerts` (index and foreign key on `rule_id`).

### Authentication

- Passwords are hashed with bcrypt (10 rounds) behind the `PasswordHasher` port. Only the hash is stored and it is never returned.
- `LoginUserUseCase` issues a JWT (`sub`, `email`, `role`) through the `TokenService` port, signed with HS256 using `JWT_SECRET` and expiring after `JWT_EXPIRES_IN`.
- `JwtAuthGuard` (interfaces) protects `GET /users/me` and depends only on the `TokenService` port.
- Unknown email and wrong password return the same 401 message (no user enumeration).
- Sprint 1 only protects `/users/me`. Measurement and alert endpoints are not authenticated yet (see the open points in `sprint-1.md`).

### HTTP conventions (`libs/common`)

- `configureHttpApp`: global prefix `/api/v1`, `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) and `ApiExceptionFilter`. It is used both by `bootstrapService` and by the HTTP tests.
- `ApiExceptionFilter` returns `{ statusCode, error, message, path, timestamp }`. Each service passes a small `ErrorStatusMap` (in `interfaces/http/error-statuses.ts`) that maps its domain and application exceptions to 400 / 401 / 404 / 409. Anything else becomes a 500 with a generic message; the stack trace is only logged.

## API Gateway

The gateway is a Facade, not a Bounded Context:

- `interfaces/http/controllers/*-routes.controller.ts` declare every public route explicitly, so Swagger documents them (`interfaces/http/dto/gateway-docs.dto.ts` holds schema-only classes).
- `infrastructure/http/downstream-proxy.ts` forwards the request with native `fetch`: same method, path and query string (`originalUrl`), JSON body and `Authorization` header. The downstream status code and body are returned unchanged. An unreachable service yields 503.
- `GET /api/v1/system/health` aggregates the health of the three services (200 when all are up, 503 otherwise).
- Downstream URLs come from `USER_SERVICE_URL`, `ENERGY_SERVICE_URL` and `ALERT_SERVICE_URL` (`infrastructure/configuration/gateway.config.ts`).
- It does not validate business data. The owning service does.

## Patterns

See [`patterns.md`](patterns.md). Implemented: Facade, Repository, Entity and Strategy. Adapter (IoT) and Observer (event-driven) are not implemented yet.

## Ports and documentation

| Application | Port | API base path | Swagger UI |
| --- | --- | --- | --- |
| `api-gateway` | 3000 | `/api/v1` | `/docs` |
| `user-service` | 3001 | `/api/v1` | `/docs` |
| `energy-monitoring-service` | 3002 | `/api/v1` | `/docs` |
| `alert-service` | 3003 | `/api/v1` | `/docs` |

## Later iterations

IoT Gateway / Adapter, Message Broker, Event Processor and event-driven integration between Energy Monitoring and Alerting (replacing the explicit `POST /alerts/evaluate` call) are planned for later sprints.
