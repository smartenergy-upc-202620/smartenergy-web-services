# Testing

```bash
pnpm test        # every suite
pnpm test:cov    # with coverage, report in coverage/
```

The tests need neither PostgreSQL nor running services.

## Current result

- 39 suites, 143 tests, all passing.
- Coverage: 95.6% statements, 86.7% branches, 97.1% functions, 95.3% lines. The uncovered code is mainly the `main.ts` entry points, the process bootstrap and the TypeORM data source factory. These are exercised by the manual run against PostgreSQL described in [`sprint-1.md`](sprint-1.md).

## Kinds of tests

| Kind | What it checks | Where |
| --- | --- | --- |
| Architecture | DDD dependency rules: domain free of frameworks and other layers; application independent of infrastructure/interfaces; interfaces independent of infrastructure; TypeORM only in infrastructure; no application imports another; libs never import apps. | `test/architecture/layer-dependencies.spec.ts` |
| Domain | Entity and value-object invariants, `ThresholdAlertStrategy`. | `apps/*/src/domain/**/*.spec.ts` |
| Application | Use cases with mocked repositories and ports. | `apps/*/src/application/use-cases/*.spec.ts` |
| Infrastructure | Mappers (ORM ↔ domain), TypeORM repositories with a mocked `Repository`, bcrypt hasher, JWT token service. | `apps/*/src/infrastructure/**/*.spec.ts` |
| HTTP (interfaces) | Real HTTP server on a random port with the production conventions (`configureHttpApp`: prefix, ValidationPipe, error filter). Use cases are real and repositories are in memory. Covers status codes 200/201/400/401/404/409 and the `/summary` vs `/:id` routing. | `apps/*/src/interfaces/http/controllers/*.spec.ts` |
| Gateway | Routing of the 12 routes to the right service against three fake upstream HTTP servers; preservation of body, query string, `Authorization` and status codes; system health; 503 when a service is down. | `apps/api-gateway/src/**/*.spec.ts` |
| Module wiring | Each `AppModule` compiles with all its providers (the TypeORM `DataSource` is replaced by a fake). | `apps/*/src/app.module.spec.ts` |
| Common | Exception filter (HTTP exceptions, mapped errors, hidden 500s), health controller. | `libs/common/src/**/*.spec.ts` |

Shared test helpers live in `test/support/http-test-app.ts`. The user-service HTTP test uses in-file fakes for `PasswordHasher` and `TokenService` so that `interfaces` code does not depend on `infrastructure`, which the architecture test enforces even in specs.

## Test inventory by Bounded Context

**User (11 suites):** `User`, `Email`, `RegisterUserUseCase`, `LoginUserUseCase`, `GetCurrentUserUseCase`, `BcryptPasswordHasher`, `JwtTokenService`, `UserMapper`, `TypeOrmUserRepository`, Auth/Users HTTP API, `AppModule`.

**Energy (9 suites):** `EnergyMeasurement`, `CreateEnergyMeasurementUseCase`, `GetEnergyMeasurementByIdUseCase`, `ListEnergyMeasurementsUseCase`, `GetEnergyConsumptionSummaryUseCase`, `EnergyMeasurementMapper`, `TypeOrmEnergyMeasurementRepository`, Measurements HTTP API, `AppModule`.

**Alert (11 suites):** `AlertRule`, `Alert`, `ThresholdAlertStrategy`, `CreateAlertRuleUseCase`, `EvaluateMeasurementForAlertsUseCase`, `ListAlertsUseCase` + `ListAlertRulesUseCase`, `GetAlertByIdUseCase`, `AlertRuleMapper` + `AlertMapper`, both TypeORM repositories, Alert rules/Alerts HTTP API, `AppModule`.

**Gateway (4 suites):** gateway config, `DownstreamProxy`, routing, `AppModule`.

**Common and architecture (4 suites):** `HealthController`, `ApiExceptionFilter`, `databaseConfig` (synchronize is never enabled in production), layer dependencies.

## BDD specifications (Gherkin)

| File | Tags | Scenarios |
| --- | --- | --- |
| `features/authentication.feature` | `@sprint-1 @identity-access` | 7 (register, duplicated email, invalid data outline, login, invalid credentials, `/users/me`, `/users/me` without token) |
| `features/energy-monitoring.feature` | `@sprint-1 @energy-monitoring` | 7 (register, invalid, list, filter by device, get by id, unknown id, summary) |
| `features/alerts.feature` | `@sprint-1 @alerting` | 8 (create rule, list rules, alert above threshold, no alert below/at threshold outline, inactive rules, list alerts, get alert, unknown alert) |

The files are valid Gherkin (checked with the official `@cucumber/gherkin` parser). They are specifications and are not executed by Cucumber: each scenario is automated by the Jest HTTP tests of its context and reproduced end to end by the Postman collection. Adding Cucumber would duplicate those tests in this sprint.

## Postman / Newman

`postman/SmartEnergy.postman_collection.json` with `postman/SmartEnergy.local.postman_environment.json` has 23 requests and 33 assertions in 5 folders, all through the gateway except the direct health checks. It can be run headless:

```bash
npx newman run postman/SmartEnergy.postman_collection.json -e postman/SmartEnergy.local.postman_environment.json
```
