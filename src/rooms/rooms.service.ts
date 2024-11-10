import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient, Room } from '@prisma/client';

@Injectable()
export class RoomsService {
  async findRoom({ code }: { code: string }): Promise<Room> {
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
    hiddenWord,
    authorId,
    author,
  }: {
    author: string;
    authorId: string;
    hiddenWord: string;
  }): Promise<Partial<Room>> {
    if (!hiddenWord) {
      throw new HttpException('Слово не указанно', HttpStatus.BAD_REQUEST);
    }

    try {
      const code = `${Math.random().toString(36).slice(2)}${Math.floor(
        Math.random().toString(36).slice(2).length * Math.random(),
      )}`;

      const prisma = new PrismaClient();
      const findRoom = await prisma.room.findFirst({
        where: {
          code,
        },
      });

      if (findRoom) {
        throw new HttpException('Комната уже существует', HttpStatus.CONFLICT);
      }

      const createdRoom = await prisma.room.create({
        data: {
          author,
          authorId,
          code,
          hiddenWord,
        },
      });
      return {
        author: createdRoom.author,
        code,
        hiddenWord: createdRoom.hiddenWord,
      };
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
      const room = await this.findRoom({ code });
      if (room.hiddenWord !== hiddenWord) {
        return null;
      }
      return room.hiddenWord;
    } catch (error) {
      console.log(error);
      throw new HttpException('Комната не найдена', HttpStatus.NOT_FOUND);
    }
  }
  async sendRoomOnTheRole({ room, userId }: { room: Room; userId: string }) {
    if (userId !== room.authorId || !userId) {
      return {
        author: room.author,
        code: room.code,
        role: 'user',
      };
    }

    return {
      author: room.author,
      code: room.code,
      hiddenWord: room.hiddenWord,
      role: 'author',
    };
  }
}
