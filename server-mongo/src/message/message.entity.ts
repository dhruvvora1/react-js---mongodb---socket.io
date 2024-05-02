import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Channel } from "src/channel/channel.entity";
import { User } from "src/user/user.entity";

@Schema()
export class Message extends Document {
  @Prop()
  id: string;

  @Prop()
  channelId: string;

  @Prop()
  channel: Channel;

  @Prop()
  userId: string;

  @Prop()
  user: User;

  @Prop()
  text: string;

  @Prop()
  images: string[];
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
