import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { MessageController } from "./message.controller";
import { MessageProvider } from "./message.provider";
import { MessageService } from "./message.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./message.entity";

@Module({
  imports: [
   //IMPORT YOU COLLECTION NAME
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
