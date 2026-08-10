import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { SignalingModule } from './signaling.module.js';

async function bootstrap() {
  const app = await NestFactory.create(SignalingModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(8080);
  console.log('🚀 NestJS 11 Signaling Gateway running on ws://localhost:8080/ws');
}
bootstrap();
