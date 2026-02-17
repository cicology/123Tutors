import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor, TutorStatus } from '../../tutors/entities/tutor.entity';

@Injectable()
export class TutorApprovedGuard implements CanActivate {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tutorId) {
      throw new ForbiddenException('Tutor access required');
    }

    const tutor = await this.tutorRepository.findOne({
      where: { id: user.tutorId },
      select: ['status'],
    });

    if (!tutor) {
      throw new ForbiddenException('Tutor not found');
    }

    // Allow access if approved
    if (tutor.status === TutorStatus.APPROVED) {
      return true;
    }

    // Check if route is in allowed routes (settings, switch roles, logout)
    const allowedRoutes = ['/tutors/profile', '/tutors/settings', '/auth/logout'];
    const route = request.route?.path || request.url;

    // If pending or rejected, only allow access to specific routes
    if (tutor.status === TutorStatus.PENDING || tutor.status === TutorStatus.REJECTED) {
      // Check if this is a settings or profile route
      if (route.includes('settings') || route.includes('profile') || route.includes('logout')) {
        return true;
      }
      throw new ForbiddenException(
        'Your tutor application is pending approval. You can only access Settings and Profile until approved.'
      );
    }

    return false;
  }
}




