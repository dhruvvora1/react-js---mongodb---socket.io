import { HttpStatus, Injectable } from "@nestjs/common";
import { HttpException, NotFoundException } from "@nestjs/common/exceptions";
import { CreateUserDto } from "./dto/create-user.dto";
import { User, UserDocument } from "./user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select("-password");
    return user;
  }

  async findBySearch(search: string): Promise<any> {
    const regex = new RegExp(search, "i");
    const users = await this.userModel.find({ username: regex });
    return users;
  }

  async createUser({ email, username, password }: CreateUserDto): Promise<any> {
    const user = await this.userModel.create({
      email,
      username,
      password,
    });
    return user;
  }

  async updateUser(user: any): Promise<any> {
    try {
      const updatedUser = await this.userModel.updateOne(user, { id: user.id });
      return updatedUser;
    } catch {
      return {
        statusCode: "409",
        message: "This username is already in use.",
      };
    }
  }

  async getFriends(
    id: string
  ): Promise<{ statusCode: string; friends: UserDocument[] }> {
    try {
      const friends: UserDocument[] = [];

      const { friends: friendIds } = await this.userModel.findById(id);

      for (const friendId of friendIds) {
        const user = await this.userModel.findById(friendId);
        if (user) {
          friends.push(user);
        }
      }

      return {
        statusCode: "200",
        friends,
      };
    } catch (error) {
      throw new HttpException("Friend not found", HttpStatus.NOT_FOUND);
    }
  }

  async setFriend({ id, otherId, status }) {
    const firstUser = await this.findById(id);
    const secondUser = await this.findById(otherId);
    try {
      const [firstUser, secondUser] = await Promise.all([
        this.userModel.findById(id),
        this.userModel.findById(otherId),
      ]);

      if (!firstUser || !secondUser) {
        throw new NotFoundException("User not found.");
      }

      if (
        (firstUser.blocked && firstUser.blocked.includes(otherId)) ||
        (secondUser.blocked && secondUser.blocked.includes(id))
      ) {
        return {
          status: "406",
          message: "You cannot do this. You are blocked.",
        };
      }

      if (status && firstUser.friends && firstUser.friends.includes(otherId)) {
        return {
          statusCode: "409",
          message: "You are already friends.",
        };
      }

      if (status) {
        await Promise.all([
          this.userModel.findByIdAndUpdate(id, {
            $addToSet: { friends: otherId },
          }),
          this.userModel.findByIdAndUpdate(otherId, {
            $addToSet: { friends: id },
          }),
        ]);
      } else {
        await Promise.all([
          this.userModel.findByIdAndUpdate(id, {
            $pull: { friends: otherId },
          }),
          this.userModel.findByIdAndUpdate(otherId, {
            $pull: { friends: id },
          }),
        ]);
      }

      return status
        ? { message: "Friendship added." }
        : { message: "Friendship removed." };
    } catch (error) {
      throw error;
    }
  }

  async getRequests(
    id: string
  ): Promise<{ statusCode: string; requests: User[] }> {
    try {
      const requests: User[] = [];
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        return { statusCode: "404", requests: [] };
      }

      const requestIds = user.requests;

      for (const requestId of requestIds) {
        const requestUser = await this.userModel.findById(requestId).exec();
        if (requestUser) {
          requests.push(requestUser);
        }
      }
      return {
        statusCode: "200",
        requests,
      };
    } catch {
      throw new HttpException("Request not found", HttpStatus.NOT_FOUND);
    }
  }

  async setRequest({ id, otherId, status }) {
    try {
      const [firstUser, secondUser] = await Promise.all([
        this.userModel.findById(id),
        this.userModel.findById(otherId),
      ]);

      if (!firstUser || !secondUser) {
        throw new NotFoundException("User not found.");
      }

      if (
        (firstUser.blocked && firstUser.blocked.includes(otherId)) ||
        (secondUser.blocked && secondUser.blocked.includes(id))
      ) {
        return {
          statusCode: 406,
          message: "You cannot do this. You are blocked.",
        };
      }

      if (status) {
        if (secondUser.friends && secondUser.friends.includes(id)) {
          return {
            statusCode: 406,
            message: "You are already friends.",
          };
        }
        if (secondUser.requests && secondUser.requests.includes(id)) {
          return {
            statusCode: 409,
            message: "You already sent a request to this user.",
          };
        }
        await this.userModel.findByIdAndUpdate(otherId, {
          $push: { requests: id },
        });
      } else {
        await this.userModel.findByIdAndUpdate(otherId, {
          $pull: { requests: id },
        });
      }

      return {
        statusCode: 200,
        message: "User updated successfully.",
      };
    } catch (error) {
      throw error;
    }
  }

  async getBlocked({ id }) {
    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new Error("User not found");
      }

      const blockedIds = user.blocked;
      const blocked: User[] = [];

      for (const blockedId of blockedIds) {
        const blockedUser = await this.userModel.findById(blockedId).exec();
        if (blockedUser) {
          blocked.push(blockedUser);
        }
      }

      return {
        statusCode: "200",
        blocked,
      };
    } catch {
      return {
        statusCode: "404",
        message: "Blocked not found.",
      };
    }
  }

  async setBlocked({ id, otherId, status }) {
    const firstUser = await this.findById(id);
    const secondUser = await this.findById(otherId);

    if (!firstUser || !secondUser)
      throw new NotFoundException("User not found.");

    // Check if user is blocked
    if (status && firstUser.blocked && firstUser.blocked.includes(otherId))
      return {
        statusCode: "409",
        message: "This user has already been blocked.",
      };

    await this.userModel.findByIdAndUpdate(id, {
      $addToSet: { blocked: otherId },
    });

    if (status) {
      await this.setFriend({ id, otherId, status: false });
      await this.setRequest({ id, otherId, status: false });
    } else {
      await this.userModel.findByIdAndUpdate(id, {
        $pull: { blocked: otherId },
      });
    }

    return {
      statusCode: "200",
      message: "User updated successfully.",
    };
  }
}
