import { Repository } from 'typeorm';
import { EnergyMeasurement } from '../../../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementOrmEntity } from '../entities/energy-measurement.orm-entity';
import { TypeOrmEnergyMeasurementRepository } from './typeorm-energy-measurement.repository';

describe('TypeOrmEnergyMeasurementRepository', () => {
  const row: EnergyMeasurementOrmEntity = {
    id: 'm-1',
    deviceId: 'device-001',
    consumptionKwh: 3.75,
    measuredAt: new Date('2026-10-06T10:30:00.000Z'),
  };
  let orm: jest.Mocked<
    Pick<Repository<EnergyMeasurementOrmEntity>, 'save' | 'findOneBy' | 'find'>
  >;
  let repository: TypeOrmEnergyMeasurementRepository;

  beforeEach(() => {
    orm = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn().mockResolvedValue([row]),
    };
    repository = new TypeOrmEnergyMeasurementRepository(
      orm as unknown as Repository<EnergyMeasurementOrmEntity>,
    );
  });

  it('saves the persistence model', async () => {
    await repository.save(EnergyMeasurement.create(row));

    expect(orm.save).toHaveBeenCalledWith(expect.objectContaining(row));
  });

  it('finds by id and maps to the domain, or returns null', async () => {
    orm.findOneBy.mockResolvedValueOnce(row).mockResolvedValueOnce(null);

    await expect(repository.findById('m-1')).resolves.toBeInstanceOf(
      EnergyMeasurement,
    );
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('lists the most recent first, optionally filtered by device', async () => {
    const all = await repository.findAll();
    await repository.findAll({ deviceId: 'device-001' });

    expect(all[0]).toBeInstanceOf(EnergyMeasurement);
    expect(orm.find).toHaveBeenNthCalledWith(1, {
      where: {},
      order: { measuredAt: 'DESC' },
    });
    expect(orm.find).toHaveBeenNthCalledWith(2, {
      where: { deviceId: 'device-001' },
      order: { measuredAt: 'DESC' },
    });
  });
});
