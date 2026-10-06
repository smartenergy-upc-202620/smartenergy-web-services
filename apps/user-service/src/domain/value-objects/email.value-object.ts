import { InvalidEmailException } from '../exceptions/invalid-email.exception';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailException(raw);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
