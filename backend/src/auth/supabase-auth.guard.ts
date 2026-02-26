import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (!this.supabase) {
      // If Supabase is not configured, allow request (for development)
      console.warn('Supabase not configured, allowing request');
      return true;
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request for use in controllers
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  private supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !this.supabase) {
      return true; // Allow unauthenticated access
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const { data: { user } } = await this.supabase.auth.getUser(token);
      if (user) {
        request.user = user;
      }
    } catch (error) {
      // Ignore errors, just don't attach user
    }

    return true;
  }
}
