import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Return payload with user info - don't fetch from DB on every request
    // The payload already contains necessary info: roles, tutorId, studentId
    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
      roles: payload.roles || [],
      tutorId: payload.tutorId || null,
      studentId: payload.studentId || null,
    };
  }
}

