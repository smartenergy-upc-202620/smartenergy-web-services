# Refactoring report: from scaffolding to Sprint 1

Starting point: commit `2e2ea5c` ("initialize SmartEnergy DDD backend workspace"). Four NestJS apps exposing only `GET /health`, a domain skeleton (entities, repository interfaces) in the three business services, `libs/common` with bootstrap, Swagger and health, an empty `libs/contracts`, and the architecture test. That state had 12 suites and 32 tests.

This report lists what was refined and why. Everything below is part of the Sprint 1 branch (`feature/sprint-1-core-backend`).

## 1. What was kept

- The monorepo layout, the four applications, ports 3000–3003, the `/api/v1` prefix and `/docs`.
- The DDD layer structure and the dependency rules. The architecture test was extended, not relaxed.
- `bootstrapService`, `HealthModule`, `AppConfigModule` and `databaseConfig` in `libs/common`.
- The domain classes `EnergyMeasurement`, `Email`, `User`, `AlertRule` and `Alert`, their factory/constructor style, and the repository-interface-plus-`Symbol`-token convention.
- The 32 original tests. They still run; some were updated where the model changed (below).

## 2. Domain model refinements

| Element | Before | After | Reason |
| --- | --- | --- | --- |
| `User` | `id`, `email`, `passwordHash`, `createdAt`, no validation | adds `role` (`UserRole`: `HOME_USER`, `BUSINESS_ADMIN`) and constructor invariants | Sprint 1 roles. An entity should not exist in an invalid state. |
| `AlertRule` | `id`, `deviceId`, `thresholdKwh` | `id`, `name`, `thresholdKwh`, `active`, `createdAt` | The Sprint 1 model defines rules by name and threshold, applicable to any device. `deviceId` was dropped; `findByDeviceId` became `findActive`. |
| `Alert` | `alertRuleId`, `triggeredAt` | `ruleId`, `message`, `createdAt` | Matches the Sprint 1 model; the message explains why the alert was raised. |
| `EnergyMeasurement` | no id check | rejects an empty id | "Valid id" requirement. |
| `EnergyMeasurementRepository.findAll` | no parameters | optional `{ deviceId }` filter | Device filter on the list and summary. |
| `AlertRepository` / `AlertRuleRepository` | `findById`/`findByDeviceId` on rules | only the methods used by use cases | Removes dead contract methods. |

The affected specs (`user.entity.spec.ts`, `alert-rule.entity.spec.ts`, `alert.entity.spec.ts`) were updated to the new fields. The test counts per file were kept or increased.

## 3. Layers that were added

Each business service gained the layers that were empty in the scaffolding:

- **application**: one use case per operation, application exceptions (not found, duplicated email, invalid credentials) and ports for technical services (`PasswordHasher`, `TokenService`). Use cases depend on interfaces only, never on bcrypt, JWT or TypeORM.
- **infrastructure**: persistence models (`*.orm-entity.ts`) separate from the domain entities, mappers in both directions, and `TypeOrm*Repository` classes implementing the domain contracts. Security adapters for bcrypt and JWT.
- **interfaces**: controllers, HTTP DTOs with class-validator and Swagger metadata (separate from domain entities), the JWT guard, and a per-service map from exceptions to HTTP status codes.
- **domain/services** (alerting): the `AlertEvaluationStrategy` interface and `ThresholdAlertStrategy`.

## 4. Shared library (`libs/common`)

Generic technical code only; no business concepts were moved there.

- `configureHttpApp` was extracted from `bootstrapService` so production and HTTP tests share the same prefix, validation and error handling.
- `ApiExceptionFilter` and `ErrorResponseDto`: one error format across services, mapping of registered error classes to status codes, and generic 500s without stack traces.
- `postgresTypeOrmModule(schema, entities)`: one connection helper. It creates the service's own schema before synchronizing, because TypeORM does not create schemas. This was found while validating against a real PostgreSQL.
- `setupSwagger` gained an optional Bearer scheme.
- `databaseConfig` gained `synchronize`, which is always off in production.

`libs/contracts` was intentionally left empty: no service calls another in Sprint 1.

## 5. API Gateway

- Was: health endpoint and a config file with the downstream URLs.
- Now: explicit, Swagger-documented routes for the 12 public endpoints plus `/system/health`, and a `DownstreamProxy` based on native `fetch` (no new dependency) that preserves method, path, query, body, `Authorization` and status code.
- Env var `ENERGY_MONITORING_SERVICE_URL` was renamed to `ENERGY_SERVICE_URL` to match the Sprint 1 configuration contract. `gateway.config.spec.ts` was updated accordingly.

## 6. Architecture test

New rules in `test/architecture/layer-dependencies.spec.ts`:

- TypeORM (`typeorm`, `@nestjs/typeorm`) may not be imported from `domain`, `application` or `interfaces`.
- The "no imports from other applications" rule now also covers `api-gateway`.

The test caught one real violation during the sprint: the user-service HTTP spec, located under `interfaces/`, imported the bcrypt/JWT adapters from `infrastructure/`. It was fixed by using fakes for the ports in that spec instead of weakening the rule.

## 7. Dependency decisions

- `@nestjs/typeorm` and `@nestjs/jwt` are pinned to the 11.x line (NestJS 11). The 12.x releases are ESM-only and cannot be loaded by Jest 30 on Node 22.
- `bcryptjs` (pure JavaScript) instead of native `bcrypt`. It produces the same `$2b$` hashes and needs no native build on Windows, where pnpm blocks install scripts by default.
- `pg` is the PostgreSQL driver used by TypeORM.
- `@types/express` (dev) types the request/response objects used by the gateway and the error filter.

## 8. Other changes

- Postman: `postman/smartenergy-web-services.postman_collection.json` (health checks only) was replaced by `postman/SmartEnergy.postman_collection.json` plus a local environment with scripts that store tokens and ids.
- Gherkin: the `@planned` tag and the "NOT implemented" notes were removed. Scenarios now describe the implemented behaviour (including error cases) and use one tag per context.
- `package.json`: `start:dev:all` (explicit list of the four services; a `start:dev:*` wildcard would have matched itself) and `demo:seed`. `start:dev` now calls `start:dev:all`.
- `.env.example`: `ENERGY_SERVICE_URL`, `DB_SYNCHRONIZE`, `JWT_SECRET`, `JWT_EXPIRES_IN` (placeholders only).
- `docker-compose.yml` did not need changes.

## Result

| | Scaffolding | Sprint 1 |
| --- | --- | --- |
| Endpoints (excluding health) | 0 | 12 (+ `/system/health`) |
| Test suites / tests | 12 / 32 | 39 / 143 |
| Architecture checks | 13 | 17 (TypeORM rule per context, cross-app rule for the gateway) |
| Patterns implemented | none | Facade, Repository, Entity, Strategy |
