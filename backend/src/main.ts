
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use('/public', express.static(join(__dirname, '..', '..', 'public')));
    
    
    // Activation de la validation globale
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Configuration CORS pour permettre les requêtes depuis le frontend et l'app mobile
    app.enableCors({
      origin: ['http://localhost:3001', 'http://192.168.100.44:8083', 'http://192.168.100.44:3000', 'http://192.168.100.228:8083', 'http://192.168.100.228:3000', 'http://192.168.161.210:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application démarrée avec succès sur le port ${port}`);
  } catch (error) {
    logger.error(`Erreur lors du démarrage de l'application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();