import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ControlGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`👺 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('control')
  handleControlCommand(@MessageBody() data: any) {
    console.log('📥 Received command:', data);

    // Gửi lại phản hồi nếu cần
    return { event: 'ack', data: 'Command received: ' + data };
  }
}
