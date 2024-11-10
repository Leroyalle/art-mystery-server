import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Request } from 'express';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Body()
    {
      hiddenWord,
      author,
    }: {
      author: string;
      hiddenWord: string;
    },
    @Req() request: Request,
  ) {
    return await this.roomsService.createRoom({
      author,
      authorId: request.cookies['am_userId'],
      hiddenWord: hiddenWord.toLowerCase(),
    });
  }

  @Get('/:code')
  async findRoom(@Param('code') code: string, @Req() request: Request) {
    try {
      const findRoom = await this.roomsService.findRoom({
        code,
      });
      return this.roomsService.sendRoomOnTheRole({
        room: findRoom,
        userId: request.cookies['am_userId'],
      });
    } catch (error) {}
  }

  @Delete('/:code')
  async deleteRoom(@Param('code') code: string) {
    return await this.roomsService.deleteRoom(code);
  }
}
