import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.value-object';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

/** Injection token used to bind the PostgreSQL implementation (infrastructure). */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
