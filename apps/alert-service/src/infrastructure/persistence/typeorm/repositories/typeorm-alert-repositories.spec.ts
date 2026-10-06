import { Repository } from 'typeorm';
import { AlertRule } from '../../../../domain/entities/alert-rule.entity';
import { Alert } from '../../../../domain/entities/alert.entity';
import { AlertRuleOrmEntity } from '../entities/alert-rule.orm-entity';
import { AlertOrmEntity } from '../entities/alert.orm-entity';
import { TypeOrmAlertRuleRepository } from './typeorm-alert-rule.repository';
import { TypeOrmAlertRepository } from './typeorm-alert.repository';

type OrmMock<T extends object> = jest.Mocked<
  Pick<Repository<T>, 'save' | 'findOneBy' | 'find'>
>;

describe('TypeOrmAlertRuleRepository', () => {
  const row: AlertRuleOrmEntity = {
    id: 'rule-1',
    name: 'High consumption',
    thresholdKwh: 5,
    active: true,
    createdAt: new Date(),
  };
  const orm: OrmMock<AlertRuleOrmEntity> = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn().mockResolvedValue([row]),
  };
  const repository = new TypeOrmAlertRuleRepository(
    orm as unknown as Repository<AlertRuleOrmEntity>,
  );

  it('saves the persistence model', async () => {
    await repository.save(AlertRule.create(row));

    expect(orm.save).toHaveBeenCalledWith(expect.objectContaining(row));
  });

  it('lists every rule, most recent first', async () => {
    const rules = await repository.findAll();

    expect(rules[0]).toBeInstanceOf(AlertRule);
    expect(orm.find).toHaveBeenLastCalledWith({
      order: { createdAt: 'DESC' },
    });
  });

  it('only loads active rules for evaluation', async () => {
    await repository.findActive();

    expect(orm.find).toHaveBeenLastCalledWith({
      where: { active: true },
      order: { createdAt: 'ASC' },
    });
  });
});

describe('TypeOrmAlertRepository', () => {
  const row = {
    id: 'alert-1',
    ruleId: 'rule-1',
    deviceId: 'device-001',
    consumptionKwh: 8.2,
    message: 'exceeded',
    createdAt: new Date(),
  } as AlertOrmEntity;
  const orm: OrmMock<AlertOrmEntity> = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn().mockResolvedValue([row]),
  };
  const repository = new TypeOrmAlertRepository(
    orm as unknown as Repository<AlertOrmEntity>,
  );

  it('saves the persistence model', async () => {
    await repository.save(new Alert(row));

    expect(orm.save).toHaveBeenCalledWith(expect.objectContaining(row));
  });

  it('finds by id, or returns null', async () => {
    orm.findOneBy.mockResolvedValueOnce(row).mockResolvedValueOnce(null);

    await expect(repository.findById('alert-1')).resolves.toBeInstanceOf(Alert);
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('lists alerts, most recent first', async () => {
    const alerts = await repository.findAll();

    expect(alerts[0]).toBeInstanceOf(Alert);
    expect(orm.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });
});
