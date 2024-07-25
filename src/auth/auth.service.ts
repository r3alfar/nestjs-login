import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2'
import { Tokens } from './tokens/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwtPayload.type';
import { myJwtConstants } from './strategies/constants';

const prisma = new PrismaClient()

export interface userModel {
  id: string,
  name: string,
  username: string,
}

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService
  ) { }

  async signUp(userData: CreateUserDto): Promise<Tokens> {
    let hash: string
    try {
      hash = await argon2.hash(userData.password)
    } catch (error) {
      console.log("ERROR generate hash--------------------------------")
    }

    console.log("CRYPTING HASH: ", hash)

    try {
      const newUser = await prisma.users.create({
        data: {
          name: userData.name,
          username: userData.username,
          hash: hash,
        }
      })

      console.log("SUCCESS create newUser: ", newUser)

      const tokens = await this.getTokens(newUser.id, newUser.username)
      await this.updateRtHash(newUser.id, tokens.refresh_token)

      return tokens
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.log("ERROR CODE: ", error.code)
        if (error.code === 'P2002') {
          const message = "There is a unique constraint violation, a new user cannot be created with this email"
          throw {
            error_code: error.code,
            reason: message,
          }
        }
      }
    }

  }

  async signIn(userData: LoginUserDto) {
    const user = await prisma.users.findUnique({
      where: {
        username: userData.username
      }
    })

    if (!user) throw new ForbiddenException("Access Denied")

    const passwordMatch = await argon2.verify(user.hash, userData.password)
    if (!passwordMatch) throw new ForbiddenException("Access Denied")

    const tokens = await this.getTokens(user.id, user.username)
    await this.updateRtHash(user.id, tokens.refresh_token)

    return tokens
  }

  async logout(userId: string): Promise<boolean> {
    const _ = await prisma.users.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        }
      },
      data: {
        hashedRt: null
      }
    })
    // console.log("updateddd after logout: ", updated)
    return true
  }


  async getUserById(userId: string): Promise<userModel> {
    const user = await prisma.users.findUnique({
      where: {
        id: userId
      }
    })
    if (!user) throw new BadRequestException("User Not Found")
    return user
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await prisma.users.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) throw new ForbiddenException("Access Denied");

    const rtMatch = await argon2.verify(user.hashedRt, rt)
    if (!rtMatch) throw new ForbiddenException("Access Denied");

    const tokens = await this.getTokens(user.id, user.username)
    await this.updateRtHash(user.id, tokens.refresh_token)

    return tokens
  }

  async getTokens(userId: string, username: string): Promise<Tokens> {
    const at_exp = 60 * 15
    const rt_exp = 60 * 60 * 24 * 7

    const jwtPayload: JwtPayload = {
      username: username,
      sub: userId,
    }
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: myJwtConstants.secret.at,
        // expiresIn: '15m',
        expiresIn: at_exp,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: myJwtConstants.secret.rt,
        // expiresIn: '7d',
        expiresIn: rt_exp,
      })
    ]);

    return {
      access_token: at,
      refresh_token: rt,
      at_exp: at_exp,
      rt_exp: rt_exp,
    }
  }

  async updateRtHash(userId: string, refreshToken: string): Promise<void> {
    const hash = await argon2.hash(refreshToken)

    await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      }
    })

    // console.log("UPDATED RT---------------", update)
  }
}
