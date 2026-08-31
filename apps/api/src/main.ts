import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import setupApp from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Devflow')
    .setDescription(
      'DevFlow gives engineering teams one place to plan projects, track issues, run sprints, and keep everyone moving toward the next release.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // shared middlewares between environments
  setupApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
