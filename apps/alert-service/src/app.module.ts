import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AppConfigModule,
  HealthModule,
  postgresTypeOrmModule,
} from '@app/common';
import { CreateAlertRuleUseCase } from './application/use-cases/create-alert-rule.use-case';
import { EvaluateMeasurementForAlertsUseCase } from './application/use-cases/evaluate-measurement-for-alerts.use-case';
import { GetAlertByIdUseCase } from './application/use-cases/get-alert-by-id.use-case';
import { ListAlertRulesUseCase } from './application/use-cases/list-alert-rules.use-case';
import { ListAlertsUseCase } from './application/use-cases/list-alerts.use-case';
import { ALERT_RULE_REPOSITORY } from './domain/repositories/alert-rule.repository';
import { ALERT_REPOSITORY } from './domain/repositories/alert.repository';
import { ALERT_EVALUATION_STRATEGY } from './domain/services/alert-evaluation.strategy';
import { ThresholdAlertStrategy } from './domain/services/threshold-alert.strategy';
import {
  ALERTING_ORM_ENTITIES,
  ALERTING_SCHEMA,
} from './infrastructure/persistence/typeorm/alerting.persistence';
import { TypeOrmAlertRuleRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-alert-rule.repository';
import { TypeOrmAlertRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-alert.repository';
import { AlertRulesController } from './interfaces/http/controllers/alert-rules.controller';
import { AlertsController } from './interfaces/http/controllers/alerts.controller';

@Module({
  imports: [
    AppConfigModule,
    HealthModule.register('alert-service'),
    postgresTypeOrmModule(ALERTING_SCHEMA, ALERTING_ORM_ENTITIES),
    TypeOrmModule.forFeature(ALERTING_ORM_ENTITIES),
  ],
  controllers: [AlertRulesController, AlertsController],
  providers: [
    CreateAlertRuleUseCase,
    ListAlertRulesUseCase,
    EvaluateMeasurementForAlertsUseCase,
    ListAlertsUseCase,
    GetAlertByIdUseCase,
    { provide: ALERT_RULE_REPOSITORY, useClass: TypeOrmAlertRuleRepository },
    { provide: ALERT_REPOSITORY, useClass: TypeOrmAlertRepository },
    { provide: ALERT_EVALUATION_STRATEGY, useClass: ThresholdAlertStrategy },
  ],
})
export class AppModule {}
