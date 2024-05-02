import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Channel extends Document {
  @Prop()
  id: string;

  @Prop()
  participants: string[];

  @Prop()
  admins: string[];

  @Prop()
  description: string;

  @Prop()
  messages: string[];

  @Prop()
  name: string;

  @Prop()
  image: string;
}

export type ChannelDocument = Channel & Document;

export const ChannelSchema = SchemaFactory.createForClass(Channel);
