import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findOrCreateChat(tutorId: string, studentId: string): Promise<Chat> {
    let chat = await this.chatRepository.findOne({
      where: { tutorId, studentId },
      relations: ['student', 'messages'],
    });

    if (!chat) {
      chat = this.chatRepository.create({ tutorId, studentId });
      chat = await this.chatRepository.save(chat);
    }

    return chat;
  }

  async findAll(tutorId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { tutorId },
      relations: ['student', 'messages'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, tutorId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['student', 'tutor', 'messages'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.tutorId !== tutorId) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async createMessage(
    tutorId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const chat = await this.findOne(createMessageDto.chatId, tutorId);

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId: tutorId,
      senderType: 'tutor',
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update chat updatedAt
    chat.updatedAt = new Date();
    await this.chatRepository.save(chat);

    return savedMessage;
  }

  async markAsRead(chatId: string, tutorId: string): Promise<void> {
    const chat = await this.findOne(chatId, tutorId);
    await this.messageRepository.update(
      {
        chatId,
        senderType: 'student',
        isRead: false,
      },
      { isRead: true },
    );
  }
}

