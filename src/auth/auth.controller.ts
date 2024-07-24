import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { Tokens } from './tokens/tokens.type';
import { Request, Response } from 'express';
import { RtGuard } from 'src/common/guards/rt.guard';
import { AtGuard } from 'src/common/guards/at.guard';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
  async signIn(
    @Body() userData: LoginUserDto,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signIn(userData)

    //store token inside httponly cookies
    // access token
    res.cookie('accessToken', tokens.access_token, {
      httpOnly: true,
      maxAge: tokens.at_exp * 1000
      // maxAge: tokens.at_exp * 1000 - Date.now()
      // secure: for https
    })

    // refresh token
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      maxAge: tokens.rt_exp * 1000,
      // maxAge: tokens.rt_exp * 1000 - Date.now(),
      // secure: for https
    })

    return res.send({ message: "Logged in Successfully" })

  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Res() res: Response,
    @GetCurrentUserId() userId: string,
    // @Req() req: Request,
  ) {

    // const uid = req.user['sub']
    // console.log("cur uid:", uid)
    // console.log("cur req:", req.user)
    console.log("custom request userId: ", userId)

    res.cookie('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
    })

    this.authService.logout(userId)

    return res.send({ message: 'Logged Out successfully' })
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

  @UseGuards(RtGuard)
  @Get('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(
    @Res() res: Response,
    @GetCurrentUserId() userId: string,
  ) {
    // res.json(req.user)
    const user = await this.authService.getUserById(userId)
    console.log("getuserbyId backend: ", user)
    res.json(user)
  }

  @UseGuards(AtGuard)
  @Get('getCurrentUser')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @GetCurrentUserId() userId: string,
    @Res() res: Response,
  ) {
    const user = await this.authService.getUserById(userId)
    console.log("getuserbyId backend: ", user)
    res.json(user)
  }
}


// using Authorization Header Bearer

// @Post('signin')
// @HttpCode(HttpStatus.OK)
// signIn(
//   @Body() userData: LoginUserDto
// ): Promise<Tokens> {
//   return this.authService.signIn(userData)
// }

// @UseGuards(AtGuard)
// @Post('logout')
// @HttpCode(HttpStatus.OK)
// logout(
//   @GetCurrentUserId() userId: string
// ) {
//   console.log("cur userId:", userId)
//   return this.authService.logout(userId)
// }