import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorRequestsService } from '../tutor-requests/tutor-requests.service';
import { CreateTutorRequestDto } from '../tutor-requests/dto/create-tutor-request.dto';
import { TutorJobNotificationsService } from '../tutor-job-notifications/tutor-job-notifications.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly tutorRequestsService: TutorRequestsService,
    private readonly tutorJobNotificationsService: TutorJobNotificationsService,
  ) {}

  @Get('find-tutor')
  @ApiOperation({ summary: 'Find tutor based on search criteria' })
  @ApiResponse({ status: 200, description: 'Tutors found successfully' })
  async findTutor(
    @Query('specialization') specialization?: string,
    @Query('programme') programme?: string,
    @Query('university') university?: string,
    @Query('courses') courses?: string,
    @Query('bursaryName') bursaryName?: string,
  ): Promise<{ tutors: unknown[] }> {
    const tutors = await this.tutorJobNotificationsService.findTutorCandidates({
      specialization,
      programme,
      university,
      courses,
      bursaryName,
    });

    return {
      tutors,
    };
  }

  @Post('submit-request')
  @ApiOperation({ summary: 'Submit tutor request with selected tutor' })
  @ApiResponse({ status: 200, description: 'Request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async submitRequest(@Body() requestData: any) {
    const { selectedTutor, ...tutorRequestData } = requestData;

    const tutorRequest = await this.tutorRequestsService.create(tutorRequestData as CreateTutorRequestDto);

    if (selectedTutor?.id || selectedTutor?.email) {
      const selectedTutorId = selectedTutor.id || selectedTutor.email;
      await this.tutorRequestsService.update(tutorRequest.uniqueId, {
        tutorsAssignedList: selectedTutorId,
        tutorsNotifiedNum: 1,
      });
    }

    return {
      success: true,
      message: 'Request submitted successfully',
      requestId: tutorRequest.uniqueId,
      tutor: selectedTutor,
      request: tutorRequest,
    };
  }
}

