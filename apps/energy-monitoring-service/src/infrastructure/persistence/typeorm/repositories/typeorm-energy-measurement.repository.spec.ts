import { EnergyMeasurement } from '../../../../domain/entities/energy-measurement.entity';
import { EnergyMeasurementOrmEntity } from '../entities/energy-measurement.orm-entity';
import { TypeOrmEnergyMeasurementRepository } from './typeorm-energy-measurement.repository';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';


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

  
  it('US04 filters measurements by device and date range', async () => {
    const from = new Date('2026-10-01T00:00:00.000Z');
    const to = new Date('2026-10-07T23:59:59.999Z');

    await repository.findAll({
      deviceId: 'device-001',
      from,
      to,
    });

    expect(orm.find).toHaveBeenCalledWith({
      where: {
        deviceId: 'device-001',
        measuredAt: Between(from, to),
      },
      order: { measuredAt: 'DESC' },
    });
  });

  it('US04 supports open-ended date filters', async () => {
    const from = new Date('2026-10-01T00:00:00.000Z');
    const to = new Date('2026-10-07T23:59:59.999Z');

    await repository.findAll({ from });
    await repository.findAll({ to });

    expect(orm.find).toHaveBeenNthCalledWith(1, {
      where: {
        measuredAt: MoreThanOrEqual(from),
      },
      order: { measuredAt: 'DESC' },
    });

    expect(orm.find).toHaveBeenNthCalledWith(2, {
      where: {
        measuredAt: LessThanOrEqual(to),
      },
      order: { measuredAt: 'DESC' },
    });
  });


});
