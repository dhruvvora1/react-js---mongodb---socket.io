import { Injectable, NotFoundException } from "@nestjs/common";
import { Message } from "src/message/message.entity";
import { Channel } from "./channel.entity";
import { ChannelDto } from "./dto/create-channel-dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/user.entity";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private chatModule: Model<Channel>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}
  async getChannel(id: string) {
    try {
      const channel = await this.chatModule.findById(id);

      if (!channel) {
        throw new NotFoundException("Channel not found.");
      }

      const participants = [];
      for (const userId of channel.participants) {
        const user = await this.userModel.findById(userId);
        participants.push(user);
      }

      channel.participants = participants;

      return channel;
    } catch (error) {
      throw error;
    }
  }

  async getChannelsByUser(userId: string) {
    try {
      const channels = await this.chatModule
        .find({
          participants: userId,
        })
        .sort({ updatedAt: -1 })
        .select({ messages: 0, createdAt: 0 });

      const lastMessages = await Promise.all(
        channels.map(async (channel) => {
          return await this.messageModel
            .findOne({ channelId: channel.id })
            .sort({ createdAt: -1 });
        })
      );

      return {
        lastMessages,
        channels,
      };
    } catch (error) {
      return {
        statusCode: "404",
        message: "User or channel not found.",
      };
    }
  }

  async createChannel({
    participants,
    admins,
    image,
    name,
    description,
  }: ChannelDto) {
    try {
      const channel = await this.chatModule.create({
        participants,
        admins,
        image,
        name,
        description,
      });
      console.log(channel);
      return {
        statusCode: "201",
        message: "Channel created successfully.",
        channel,
      };
    } catch (error) {
      return {
        status: "400",
        message: error,
      };
    }
  }

  async updateChannel({ id, channel }) {
    try {
      const updatedChannel = await this.chatModule.findByIdAndUpdate(
        id,
        channel,
        { new: true }
      );

      if (!updatedChannel) {
        return {
          statusCode: "404",
          message: "Channel not found.",
        };
      }

      return {
        statusCode: "200",
        message: "Channel updated successfully.",
      };
    } catch {
      return {
        statusCode: "404",
        message: "Channel not found.",
      };
    }
  }

  async deleteChannel(id: string) {
    try {
      await this.chatModule.deleteOne({ id });
      return {
        statusCode: "200",
        message: "Channel deleted successfully.",
      };
    } catch {
      return {
        statusCode: "404",
        message: "Channel not found.",
      };
    }
  }
}
