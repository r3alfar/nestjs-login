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
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: (req: Request) => req.cookies['refreshToken'],
      ignoreExpiration: false,
      secretOrKey: myJwtConstants.secret.rt,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    // const refreshToken = req
    //   ?.get('authorization')
    //   ?.replace('Bearer', '')
    //   .trim();

    const refreshToken = req.cookies['refreshToken']

    if (!refreshToken) throw new ForbiddenException('RefrershToken malformed');
    return {
      ...payload,
      refreshToken,
    }
  }
}