import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { JWT_SECRET } from "../utils/constants";
import { MongooseModule } from "@nestjs/mongoose";
import { Authentication, AuthenticationSchema } from "./auth.entity";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    // IMPORT YOU COLLECTION NAME
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: "3 days" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
