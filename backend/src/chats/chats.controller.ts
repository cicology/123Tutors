import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll(@CurrentUser() tutor: any) {
    return this.chatsService.findAll(tutor.id);
  }

  @Get('with/:studentId')
  findOrCreate(@CurrentUser() tutor: any, @Param('studentId') studentId: string) {
    return this.chatsService.findOrCreateChat(tutor.id, studentId);
  }

  @Get(':id')
  findOne(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.chatsService.findOne(id, tutor.id);
  }

  @Post('messages')
  createMessage(@CurrentUser() tutor: any, @Body() createMessageDto: CreateMessageDto) {
    return this.chatsService.createMessage(tutor.id, createMessageDto);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.chatsService.markAsRead(id, tutor.id);
  }
}

