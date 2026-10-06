import { Email } from '../value-objects/email.value-object';

export interface UserProps {
  id: string;
  email: Email;
  /** Only the hash is stored; the plain password never reaches the domain. */
  passwordHash: string;
  createdAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
