import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { RoomsService } from './rooms/rooms.service';

type PaintCoords = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};
type Message = {
  name: string;
  text: string;
  pathname: string;
};

@WebSocketGateway({ cors: true })
@Injectable()
export class AppGateway {
  constructor(private readonly roomsService: RoomsService) {}
  @WebSocketServer() server: Server;

  @SubscribeMessage('paint')
  async painting(
    @MessageBody() data: PaintCoords,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.broadcast.to(socket.data.room).emit('repaint', data);
  }

  @SubscribeMessage('clear')
  async clear(@ConnectedSocket() socket: Socket) {
    socket.broadcast.to(socket.data.room).emit('clear_canvas');
  }

  @SubscribeMessage('send_message')
  async onSendMessage(
    @MessageBody() data: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.broadcast.to(socket.data.room).emit('get_message', data);

    const hiddenWord = await this.roomsService.checkHiddenWord({
      code: data.pathname,
      hiddenWord: data.text,
    });

    if (hiddenWord) {
      socket.emit('victory', {
        name: data.name,
        hiddenWord,
      });
      socket.broadcast.to(socket.data.room).emit('victory', {
        name: data.name,
        hiddenWord,
      });
      this.roomsService.deleteRoom(data.pathname);
    }
  }
  handleConnection(socket: Socket) {
    const roomId = socket.handshake.query.roomId as string;
    socket.data.room = roomId;
    socket.join(roomId);
    const onlineUsers = this.server.sockets.adapter.rooms.get(roomId);
    if (onlineUsers) {
      socket.emit('online_users', onlineUsers.size);
      socket.broadcast.to(roomId).emit('online_users', onlineUsers.size);
    }
  }
  handleDisconnect(socket: Socket) {
    if (socket.data && socket.data.room) {
      const onlineUsers = this.server.sockets.adapter.rooms.get(
        socket.data.room,
      );
      if (onlineUsers) {
        socket.broadcast
          .to(socket.data.room)
          .emit('online_users', onlineUsers.size);
      }
    }
  }
}
