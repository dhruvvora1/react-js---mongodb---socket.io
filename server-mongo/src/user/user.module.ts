import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserProviders } from "./user.providers";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserdatumSchema } from "./user.entity";

@Module({
  imports: [
    //IMPORT YOU COLLECTION NAME
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
