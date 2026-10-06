import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PasswordHasher } from '../../application/ports/password-hasher.port';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, SALT_ROUNDS);
  }

  compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }
}
