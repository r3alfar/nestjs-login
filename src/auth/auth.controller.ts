import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { Tokens } from './tokens/tokens.type';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RtGuard } from 'src/common/guards/rt.guard';
import { AtGuard } from 'src/common/guards/at.guard';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
// import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(
    @Body() userData: CreateUserDto
  ): Promise<Tokens> {
    try {
      return this.authService.signUp(userData)
    } catch (error) {
      // console.log("CONTROLLER ERROR: ", error)
      return error
    }

  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(
    @Body() userData: LoginUserDto
  ): Promise<Tokens> {
    return this.authService.signIn(userData)
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentUserId() userId: string
  ) {
    console.log("cur userId:", userId)
    return this.authService.logout(userId)
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string
  ) {
    return this.authService.refreshTokens(userId, refreshToken)
    // return this.authService.refreshTokens(user['sub'], user['refreshToken'])
  }
}
