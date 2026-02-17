import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: '123tutors API',
      version: '1.0.0',
      endpoints: {
        auth: '/auth',
        courses: '/courses',
        tutors: '/tutors',
        students: '/students',
        lessons: '/lessons',
        payments: '/payments',
        reviews: '/reviews',
        chats: '/chats',
        admin: '/admin',
        referrals: '/referrals',
        requests: '/requests',
        notifications: '/notifications',
      },
      docs: 'This is the backend API. Frontend should be accessed at http://localhost:8080',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}






