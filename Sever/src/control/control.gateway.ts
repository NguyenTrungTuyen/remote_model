
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Định nghĩa interface cho cài đặt để đảm bảo kiểu dữ liệu
interface CrosstalkSettings {
  display: string;
  mic: string;
  overlayMode: string;
  showTranscription: boolean;
  showTranslation: boolean;
  fromLang: string;
  toLang: string;
}

@WebSocketGateway({ cors: true })
export class ControlGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Lưu trữ cài đặt hiện tại (có thể thay bằng database hoặc service nếu cần)
  private settings: CrosstalkSettings = {
    display: 'primary',
    mic: 'default',
    overlayMode: 'subtitle',
    showTranscription: true,
    showTranslation: true,
    fromLang: 'en',
    toLang: 'vi',
  };

  handleConnection(client: Socket) {
    console.log(`👺 Client connected: ${client.id}`);
    // Gửi trạng thái cài đặt hiện tại cho client khi kết nối
    client.emit('status:update', {
      connected: true,
      isRunning: false,
      settings: this.settings,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('control:start')
  handleControlStart(@MessageBody() data: any, client: Socket) {
    console.log('▶️ Received start command:', data);
    // Xử lý logic khi bắt đầu (ví dụ: bắt đầu ghi âm, xử lý overlay, v.v.)
    this.server.emit('status:update', {
      connected: true,
      isRunning: true,
      settings: this.settings,
    });
    return { event: 'ack', data: 'Start command received' };
  }

  @SubscribeMessage('control:stop')
  handleControlStop(@MessageBody() data: any, client: Socket) {
    console.log('⏹️ Received stop command:', data);
    // Xử lý logic khi dừng (ví dụ: dừng ghi âm, dừng overlay, v.v.)
    this.server.emit('status:update', {
      connected: true,
      isRunning: false,
      settings: this.settings,
    });
    return { event: 'ack', data: 'Stop command received' };
  }

  @SubscribeMessage('settings:update')
  handleSettingsUpdate(@MessageBody() data: Partial<CrosstalkSettings>, client: Socket) {
    console.log('⚙️ Received settings update:', data);
    // Cập nhật cài đặt với dữ liệu mới
    this.settings = { ...this.settings, ...data };
    // Gửi trạng thái cập nhật tới tất cả client
    this.server.emit('status:update', {
      connected: true,
      isRunning: false, // Có thể điều chỉnh trạng thái isRunning tùy theo logic
      settings: this.settings,
    });
    return { event: 'ack', data: 'Settings updated successfully' };
  }

  @SubscribeMessage('overlay:move')
  handleOverlayMove(@MessageBody() data: { direction: string }, client: Socket) {
    console.log('🎯 Received overlay move command:', data);
    // Xử lý logic di chuyển overlay (ví dụ: cập nhật vị trí overlay trên server)
    return { event: 'ack', data: `Overlay move command received: ${data.direction}` };
  }
}
