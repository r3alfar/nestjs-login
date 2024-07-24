import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { myJwtConstants } from "./constants";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../types/jwtPayload.type";
import { Request } from "express";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: (req: Request) => {
        const token = req.cookies['accessToken'];
        console.log('access Token: ', token);
        return token || null
      },
      ignoreExpiration: false,
      secretOrKey: myJwtConstants.secret.at
    })
  }

  validate(payload: JwtPayload) {
    return payload
  }
}