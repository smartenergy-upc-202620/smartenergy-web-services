import { InvalidUserException } from '../exceptions/invalid-user.exception';
import { Email } from '../value-objects/email.value-object';
import { isUserRole, UserRole } from '../value-objects/user-role';

export interface UserProps {
  id: string;
  email: Email;
  /** Only the hash is stored; the plain password never reaches the domain. */
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {
    if (props.id.trim().length === 0) {
      throw new InvalidUserException('id must not be empty');
    }
    if (props.passwordHash.trim().length === 0) {
      throw new InvalidUserException('passwordHash must not be empty');
    }
    if (!isUserRole(props.role)) {
      throw new InvalidUserException(`Unknown role: "${props.role}"`);
    }
    if (Number.isNaN(props.createdAt.getTime())) {
      throw new InvalidUserException('createdAt must be a valid date');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
