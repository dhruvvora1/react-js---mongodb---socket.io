import { Module } from "@nestjs/common";
import { MessageModule } from "src/message/message.module";
import { ChannelController } from "./channel.controller";
import { ChannelGateway } from "./channel.gateway";
import { ChannelService } from "./channel.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Channel, ChannelSchema } from "./channel.entity";
import { Message, MessageSchema } from "src/message/message.entity";
import { User, UserdatumSchema } from "src/user/user.entity";

@Module({
  imports: [
   //IMPORT YOU COLLECTION NAME
    MessageModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService],
})
export class ChannelModule {}
