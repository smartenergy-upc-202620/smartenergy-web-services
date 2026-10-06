import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AppConfigModule,
  HealthModule,
  postgresTypeOrmModule,
} from '@app/common';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/token-service.port';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token-service';
import { AuthController } from './interfaces/http/controllers/auth.controller';
import { UsersController } from './interfaces/http/controllers/users.controller';
import { JwtAuthGuard } from './interfaces/http/guards/jwt-auth.guard';

@Module({
  imports: [
    AppConfigModule,
    HealthModule.register('user-service'),
    postgresTypeOrmModule('identity_access', [UserOrmEntity]),
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    GetCurrentUserUseCase,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
})
export class AppModule {}
