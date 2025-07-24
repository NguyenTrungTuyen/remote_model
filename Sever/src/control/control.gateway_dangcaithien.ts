import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

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

  private settings: Map<string, CrosstalkSettings> = new Map();
  private defaultSettings: CrosstalkSettings = {
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
    const clientType = client.handshake.query.type as string;
    const deviceId = client.handshake.query.deviceId as string;

    if (!deviceId || !clientType) {
      client.emit('error', { message: 'Missing deviceId or clientType' });
      client.disconnect();
      return;
    }

    if (clientType === 'FE') {
      client.join(`device-${deviceId}`);
    } else if (clientType === 'Electron') {
      client.join(`device-${deviceId}`);
      if (!this.settings.has(deviceId)) {
        this.settings.set(deviceId, { ...this.defaultSettings });
      }
    } else {
      client.emit('error', { message: 'Invalid client type' });
      client.disconnect();
      return;
    }

    client.emit('status:update', {
      connected: true,
      isRunning: false,
      settings: this.settings.get(deviceId) || this.defaultSettings,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('control:start')
  handleControlStart(@MessageBody() data: any, client: Socket) {
    try {
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`▶️ Start command [${deviceId}]:`, data);
      this.server.to(`device-${deviceId}`).emit('control', { action: 'start', data });
      this.server.to(`device-${deviceId}`).emit('status:update', {
        connected: true,
        isRunning: true,
        settings: this.settings.get(deviceId) || this.defaultSettings,
      });
      return { event: 'ack', data: 'Start command received' };
    } catch (error) {
      console.error('Error in control:start:', error.message);
      client.emit('error', { message: 'Invalid start payload' });
    }
  }

  @SubscribeMessage('control:stop')
  handleControlStop(@MessageBody() data: any, client: Socket) {
    try {
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`⏹️ Stop command [${deviceId}]:`, data);
      this.server.to(`device-${deviceId}`).emit('control', { action: 'stop', data });
      this.server.to(`device-${deviceId}`).emit('status:update', {
        connected: true,
        isRunning: false,
        settings: this.settings.get(deviceId) || this.defaultSettings,
      });
      return { event: 'ack', data: 'Stop command received' };
    } catch (error) {
      console.error('Error in control:stop:', error.message);
      client.emit('error', { message: 'Invalid stop payload' });
    }
  }

  @SubscribeMessage('settings:update')
  handleSettingsUpdate(@MessageBody() data: Partial<CrosstalkSettings>, client: Socket) {
    try {
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`⚙️ Settings update [${deviceId}]:`, data);
      const currentSettings = this.settings.get(deviceId) || this.defaultSettings;
      const newSettings = { ...currentSettings, ...data };
      this.settings.set(deviceId, newSettings);
      this.server.to(`device-${deviceId}`).emit('status:update', {
        connected: true,
        isRunning: false,
        settings: newSettings,
      });
      return { event: 'ack', data: 'Settings updated successfully' };
    } catch (error) {
      console.error('Error in settings:update:', error.message);
      client.emit('error', { message: 'Invalid settings payload' });
    }
  }

  @SubscribeMessage('overlay:move')
  handleOverlayMove(@MessageBody() data: { direction: string }, client: Socket) {
    try {
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`🎯 Overlay move command [${deviceId}]:`, data);
      this.server.to(`device-${deviceId}`).emit('control', { action: 'overlay:move', data });
      return { event: 'ack', data: `Overlay move command received: ${data.direction}` };
    } catch (error) {
      console.error('Error in overlay:move:', error.message);
      client.emit('error', { message: 'Invalid overlay move payload' });
    }
  }

  @SubscribeMessage('control')
  handleControl(client: Socket, payload: any): void {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid control payload');
      }
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`🎮 Control command from FE [${deviceId}]:`, payload);
      this.server.to(`device-${deviceId}`).emit('control', payload);
    } catch (error) {
      console.error('Error in control:', error.message);
      client.emit('error', { message: 'Invalid control payload' });
    }
  }

  @SubscribeMessage('state-update')
  handleStateUpdate(client: Socket, payload: any): void {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid state-update payload');
      }
      const deviceId = client.handshake.query.deviceId as string;
      console.log(`📡 State update from Electron [${deviceId}]:`, payload);
      this.server.to(`device-${deviceId}`).emit('state-update', payload);
    } catch (error) {
      console.error('Error in state-update:', error.message);
      client.emit('error', { message: 'Invalid state-update payload' });
    }
  }
}