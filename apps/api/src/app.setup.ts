import { INestApplication, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

function setupApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  const logger = new Logger('HTTP');

  // Register Morgan globally
  app.use(
    morgan('dev', {
      stream: {
        write: (message: string) => logger.log(message.trim()),
      },
    }),
  );
  app.use(cookieParser());
}

export default setupApp;
