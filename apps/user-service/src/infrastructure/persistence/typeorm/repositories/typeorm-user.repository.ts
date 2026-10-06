import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { EmailAlreadyRegisteredException } from '../../../../application/exceptions/email-already-registered.exception';
import { User } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { Email } from '../../../../domain/value-objects/email.value-object';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    try {
      await this.repository.save(UserMapper.toPersistence(user));
    } catch (error) {
      // Concurrent registrations with the same email hit the unique index.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code ===
          POSTGRES_UNIQUE_VIOLATION
      ) {
        throw new EmailAlreadyRegisteredException(user.email.value);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOneBy({ email: email.value });
    return entity ? UserMapper.toDomain(entity) : null;
  }
}
