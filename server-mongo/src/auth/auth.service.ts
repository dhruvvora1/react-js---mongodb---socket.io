import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException();
    const same = await bcrypt.compare(password, user.password);
    if (same) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(data) {
    const user = data?.email;
    const payload = {
      email: user,
    };
    const userDetail = await this.userService.findByEmail(user);

    return {
      statusCode: "200",
      user: data,
      detail: userDetail,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDoc: CreateUserDto): Promise<any> {
    const user = await this.userService.findByEmail(userDoc.email);
    if (user) throw new ConflictException("User already exists.");
    await this.userService.createUser(userDoc);
    return {
      statusCode: "201",
      message: "User created successfully.",
    };
  }
}
