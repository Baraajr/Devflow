import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

function setupApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());
}

export default setupApp;
