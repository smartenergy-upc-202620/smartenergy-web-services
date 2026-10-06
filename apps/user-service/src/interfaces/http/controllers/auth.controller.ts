import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginResponseDto, UserResponseDto } from '../dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'The email is already registered',
  })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return UserResponseDto.fromDomain(await this.registerUser.execute(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and obtain a JWT access token' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid email or password',
  })
  async login(@Body() dto: LoginUserDto): Promise<LoginResponseDto> {
    const { accessToken, user } = await this.loginUser.execute(dto);
    return { accessToken, user: UserResponseDto.fromDomain(user) };
  }
}
