import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
  @Prop()
  id: string;

  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  about: string;

  @Prop({
    default:
      "https://res.cloudinary.com/dtzs4c2uv/image/upload/v1666326774/noavatar_rxbrbk.png",
  })
  image: string;

  @Prop()
  public friends: Array<string>;

  @Prop()
  blocked: Array<string>;

  @Prop()
  requests: Array<string>;
}

export type UserDocument = User & Document;

export const UserdatumSchema = SchemaFactory.createForClass(User);
