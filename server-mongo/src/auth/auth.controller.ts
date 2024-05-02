import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/login")
  async login(@Request() req) {
    return this.authService.login(req.body);
  }

  @HttpCode(201)
  @Post("/register")
  async register(@Body() body) {
    return this.authService.register(body);
  }
}
