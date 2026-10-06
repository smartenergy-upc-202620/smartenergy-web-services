import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.value-object';
import { UserRole } from '../../../../domain/value-objects/user-role';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return new User({
      id: entity.id,
      email: Email.create(entity.email),
      passwordHash: entity.passwordHash,
      role: entity.role as UserRole,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.email = user.email.value;
    entity.passwordHash = user.passwordHash;
    entity.role = user.role;
    entity.createdAt = user.createdAt;
    return entity;
  }
}
