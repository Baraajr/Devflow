import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sets an HTTP-only authentication cookie.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid registration data.',
  })
  @ApiConflictResponse({
    description: 'Email is already registered.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    this.setAuthCookie(res, result.accessToken);

    return result.user;
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates a user and sets an HTTP-only authentication cookie.',
  })
  @ApiOkResponse({
    description: 'User successfully authenticated.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid login data.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    this.setAuthCookie(res, result.accessToken);

    res.status(HttpStatus.OK).send(result.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user returned successfully.',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the token is invalid.',
  })
  me(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clears the authentication cookie and logs the user out.',
  })
  @ApiOkResponse({
    description: 'User successfully logged out.',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(HttpStatus.OK).send({
      message: 'Logged out successfully',
    });
  }

  private setAuthCookie(res: Response, accessToken: string): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });
  }
}
