import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { UserProfile } from '../user-profiles/user-profiles.entity';

@Injectable()
export class BursaryAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userProfilesService: UserProfilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserProfile = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Fetch the complete user profile from database to ensure we have the latest userType
      const userProfile = await this.userProfilesService.findOne(user.email);
      
      if (!userProfile) {
        throw new ForbiddenException('User profile not found');
      }

      if (userProfile.userType !== 'bursary_admin') {
        throw new ForbiddenException('Access denied. Bursary admin role required.');
      }

      // Update the request user with the complete profile
      request.user = userProfile;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify user permissions');
    }
  }
}
