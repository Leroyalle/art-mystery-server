import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient, Room } from '@prisma/client';

@Injectable()
export class RoomsService {
  async findRoom(code: string): Promise<Room> {
    if (!code) {
      throw new HttpException('Не указан код комнаты', HttpStatus.BAD_REQUEST);
    }
    try {
      const prisma = new PrismaClient();
      const findRoom = await prisma.room.findFirst({
        where: {
          code,
        },
      });
      if (!findRoom) {
        throw new HttpException('Комната не найдена', HttpStatus.NOT_FOUND);
      }

      return findRoom;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Ошибка при получении комнаты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createRoom({
    code,
    hiddenWord,
  }: {
    code: string;
    hiddenWord: string;
  }): Promise<Room> {
    if (!code || !hiddenWord) {
      throw new HttpException(
        'Код или слово не указаны',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const prisma = new PrismaClient();
      const room = await prisma.room.create({
        data: {
          code,
          hiddenWord,
        },
      });
      return room;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Ошибка при создании комнаты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRoom(code: string): Promise<Room> {
    if (!code) {
      throw new HttpException('Не указан код комнаты', HttpStatus.BAD_REQUEST);
    }
    try {
      const prisma = new PrismaClient();
      const findRoom = await prisma.room.findFirst({
        where: {
          code,
        },
      });

      if (!findRoom) {
        throw new HttpException('Комната не найдена', HttpStatus.NOT_FOUND);
      }

      const deletedRoom = await prisma.room.delete({
        where: {
          id: findRoom.id,
        },
      });
      return deletedRoom;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Ошибка при удалении комнаты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async checkHiddenWord({
    code,
    hiddenWord,
  }: {
    code: string;
    hiddenWord: string;
  }) {
    try {
      const room = await this.findRoom(code);
      if (room.hiddenWord !== hiddenWord) {
        return null;
      } else {
        console.log('true');
        return room.hiddenWord;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
