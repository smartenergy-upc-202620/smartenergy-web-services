import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Persistence model of `identity_access.users`. Not a domain entity. */
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 32 })
  role: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
