import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "src/auth/types/jwtPayload.type";

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest()
    // console.log("getcurrentuserid:", request)
    const user = request.user as JwtPayload
    return user.sub;
  }
)