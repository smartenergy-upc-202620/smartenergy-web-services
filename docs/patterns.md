# Design patterns

Only patterns that exist in the code are listed as implemented.

## Facade: API Gateway

The gateway gives clients one entry point (`http://localhost:3000/api/v1`) in front of three services and hides their location.

- Routes: `apps/api-gateway/src/interfaces/http/controllers/`
  - `identity-routes.controller.ts` → user-service
  - `energy-routes.controller.ts` → energy-monitoring-service
  - `alerting-routes.controller.ts` → alert-service
  - `system-health.controller.ts` → aggregated health
- Forwarding: `apps/api-gateway/src/infrastructure/http/downstream-proxy.ts` (`DownstreamProxy.forward`)
- Configuration: `apps/api-gateway/src/infrastructure/configuration/gateway.config.ts`

It has no business logic: it does not validate, transform or decide anything about the data. Routing is covered by `apps/api-gateway/src/interfaces/http/controllers/gateway-routing.spec.ts`.

## Repository

The domain declares what it needs as interfaces. Infrastructure implements them with TypeORM, and the composition root (`app.module.ts`) binds each interface to its implementation through a `Symbol` token (Dependency Inversion).

| Contract (domain) | Implementation (infrastructure) |
| --- | --- |
| `apps/user-service/src/domain/repositories/user.repository.ts` | `apps/user-service/src/infrastructure/persistence/typeorm/repositories/typeorm-user.repository.ts` |
| `apps/energy-monitoring-service/src/domain/repositories/energy-measurement.repository.ts` | `apps/energy-monitoring-service/src/infrastructure/persistence/typeorm/repositories/typeorm-energy-measurement.repository.ts` |
| `apps/alert-service/src/domain/repositories/alert-rule.repository.ts` | `apps/alert-service/src/infrastructure/persistence/typeorm/repositories/typeorm-alert-rule.repository.ts` |
| `apps/alert-service/src/domain/repositories/alert.repository.ts` | `apps/alert-service/src/infrastructure/persistence/typeorm/repositories/typeorm-alert.repository.ts` |

Repositories accept and return domain entities only. Mappers in `infrastructure/persistence/typeorm/mappers/` convert to and from the ORM classes in `infrastructure/persistence/typeorm/entities/`. Use cases depend only on the interfaces, which is why the unit tests can use mocks and the HTTP tests in-memory implementations.

## Entity

Domain objects with identity and invariants, free of frameworks:

- `apps/user-service/src/domain/entities/user.entity.ts`: `User` (non-empty id and password hash, known role, valid date). Uses the value objects `Email` (`domain/value-objects/email.value-object.ts`) and `UserRole` (`domain/value-objects/user-role.ts`).
- `apps/energy-monitoring-service/src/domain/entities/energy-measurement.entity.ts`: `EnergyMeasurement` (non-empty id and device, consumption ≥ 0, valid date).
- `apps/alert-service/src/domain/entities/alert-rule.entity.ts`: `AlertRule` (non-empty name, threshold > 0, valid date).
- `apps/alert-service/src/domain/entities/alert.entity.ts`: `Alert`.

They are separate from the persistence classes (`*.orm-entity.ts`), which are the only ones carrying TypeORM decorators.

## Strategy: alert rule evaluation

How a consumption reading is checked against a rule is behind an interface, so new kinds of rules can be added without changing the use case.

- Strategy interface: `apps/alert-service/src/domain/services/alert-evaluation.strategy.ts` (`AlertEvaluationStrategy.evaluate(rule, reading)` returns the alert message or `null`).
- Concrete strategy: `apps/alert-service/src/domain/services/threshold-alert.strategy.ts` (`ThresholdAlertStrategy`: active rule and consumption strictly above `thresholdKwh`).
- Context: `apps/alert-service/src/application/use-cases/evaluate-measurement-for-alerts.use-case.ts` receives the strategy by injection (`ALERT_EVALUATION_STRATEGY`).
- Binding: `apps/alert-service/src/app.module.ts`.

There is one strategy because Sprint 1 has one kind of rule. A new one (for example, accumulated daily consumption) means a new class implementing `AlertEvaluationStrategy`, plus a rule type to choose it once a second kind exists.

## Not implemented yet

- **Adapter** for IoT devices or protocols (MQTT, gateways): planned for a later sprint. The bcrypt and JWT classes implement application ports in the ports-and-adapters sense, but there is no IoT Adapter yet.
- **Observer / event-driven integration** (Message Broker, Event Processor): planned. Alert evaluation is currently triggered explicitly with `POST /alerts/evaluate`.
