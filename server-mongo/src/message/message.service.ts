import { Injectable } from "@nestjs/common";
import { Channel } from "src/channel/channel.entity";
import { User } from "src/user/user.entity";
import { CreateMessageDto } from "./dto/create-message-dto";
import { Message } from "./message.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>
  ) {}
  async getMessage({ id }) {
    try {
      const message = await this.messageModel.findOne(id).exec();
      return message;
    } catch (error) {
      return {
        statusCode: "404",
        message: "Message not found.",
      };
    }
  }

  async getMessagesByChannel({ id }) {
    try {
      const messages = await this.messageModel
        .find({ channelId: id })
        .sort({ createdAt: "asc" })
        .populate("user");
      return messages;
    } catch (error) {
      return {
        statusCode: "404",
        message: "Message not found.",
      };
    }
  }

  async addMessage({ text, images, channelId, userId }: CreateMessageDto) {
    const message = await this.messageModel.create({
      text,
      images,
      channelId,
      userId,
    });

    try {
      await this.messageModel.findByIdAndUpdate(
        channelId,
        { $push: { messages: message._id } },
        { new: true }
      );

      return {
        statusCode: "201",
        message: "Message created successfully.",
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error,
      };
    }
  }

  async updateMessage({ id, message }) {
    try {
      await this.messageModel.findByIdAndUpdate(message, { id });
      return {
        statusCode: "200",
        message: "Message updated successfully.",
      };
    } catch {
      return {
        statusCode: "404",
        message: "Message not found.",
      };
    }
  }

  async deleteMessage({ id }) {
    try {
      await this.messageModel.deleteOne({ id });
      return {
        statusCode: "200",
        message: "Message deleted successfully.",
      };
    } catch {
      return {
        statusCode: "404",
        message: "Message not found.",
      };
    }
  }
}
