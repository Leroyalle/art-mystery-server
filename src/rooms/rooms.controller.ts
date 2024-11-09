import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Body() { code, hiddenWord }: { code: string; hiddenWord: string },
  ) {
    return await this.roomsService.createRoom({ code, hiddenWord });
  }

  @Get('/:code')
  async findRoom(@Param('code') code: string) {
    return await this.roomsService.findRoom(code);
  }

  @Delete('/:code')
  async deleteRoom(@Param('code') code: string) {
    return await this.roomsService.deleteRoom(code);
  }
}
