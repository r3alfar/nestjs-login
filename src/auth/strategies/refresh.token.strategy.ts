import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { myJwtConstants } from "./constants";
import { Request } from "express";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtPayload } from "../types/jwtPayload.type";
import { JwtPayloadWithRt } from "../types/jwtPayloadWithRt.type";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req.cookies['refreshToken'];
        return token || null
      },

      ignoreExpiration: false,
      secretOrKey: myJwtConstants.secret.rt,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req.cookies['refreshToken']

    const accessToken = req.cookies['accessToken']

    if (!refreshToken) throw new ForbiddenException('RefrershToken malformed');
    return {
      ...payload,
      refreshToken,
      accessToken,
    }
  }
}