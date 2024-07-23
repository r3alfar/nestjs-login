import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { myJwtConstants } from "./constants";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../types/jwtPayload.type";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: myJwtConstants.secret.at
    })
  }

  validate(payload: JwtPayload) {
    return payload
  }
}