import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@app/common';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthenticatedRequest, JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly getCurrentUser: GetCurrentUserUseCase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Missing, invalid or expired bearer token',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'The user of the token no longer exists',
  })
  async me(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    return UserResponseDto.fromDomain(
      await this.getCurrentUser.execute(request.user.sub),
    );
  }
}
