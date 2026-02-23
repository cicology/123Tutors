import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { UserProfile } from '../user-profiles/user-profiles.entity';
import { UserType } from '../user-profiles/dto/create-user-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, userType?: UserType): Promise<UserProfile | null> {
    try {
      const user = await this.userProfilesService.findOne(email);
      if (userType && user.userType !== userType) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async login(user: UserProfile): Promise<{ access_token: string; user: UserProfile }> {
    const payload = { email: user.email, userType: user.userType, sub: user.uniqueId };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(email: string, userType: UserType, uniqueId: string): Promise<{ access_token: string; user: UserProfile }> {
    const user = await this.userProfilesService.create({
      email,
      userType,
      uniqueId,
    });
    return this.login(user);
  }

  async validateToken(token: string): Promise<UserProfile> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userProfilesService.findOne(payload.email);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
