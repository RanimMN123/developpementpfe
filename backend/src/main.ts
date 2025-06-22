
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import { XssProtectionInterceptor } from './security/interceptors/xss-protection.interceptor';
import { SecurityService } from './security/security.service';


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Configuration du serveur de fichiers statiques pour les images
    const publicPath = join(__dirname, '..', '..', 'public');
    console.log('📁 Chemin des fichiers statiques:', publicPath);

    // Vérifier que le dossier existe
    if (fs.existsSync(publicPath)) {
      console.log('✅ Dossier public trouvé');
      const imagesPath = join(publicPath, 'images');
      if (fs.existsSync(imagesPath)) {
        const imageFiles = fs.readdirSync(imagesPath).slice(0, 3);
        console.log('✅ Dossier images trouvé, exemples:', imageFiles);
      } else {
        console.log('❌ Dossier images non trouvé');
      }
    } else {
      console.log('❌ Dossier public non trouvé');
    }

    app.use('/public', express.static(publicPath));

    // Servir aussi les images directement depuis /images pour compatibilité
    app.use('/images', express.static(join(publicPath, 'images')));

    // Configuration de sécurité avancée
    app.use(express.json({ limit: '10mb' })); // Limiter la taille des requêtes JSON
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Désactiver les headers qui révèlent des informations sur le serveur
    app.getHttpAdapter().getInstance().disable('x-powered-by');

    // Activation de la validation globale renforcée
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production', // Masquer les détails en production
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          // Logger les tentatives de validation échouées
          logger.warn('Validation échouée', { errors: errors.map(e => e.toString()) });
          return new Error('Données invalides');
        },
      }),
    );

    // Intercepteurs globaux
    // const securityService = new SecurityService();
    // app.useGlobalInterceptors(
    //   new XssProtectionInterceptor(securityService) // Protection XSS uniquement - TEMPORAIREMENT DÉSACTIVÉ
    // );
    
    // Configuration CORS pour localhost et mobile
    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Pour le mobile avec IPs du réseau local
      'http://192.168.100.138:3000',
      'http://192.168.100.114:3000',
      'http://192.168.100.44:3000',
      'http://192.168.100.228:3000',
      'http://192.168.1.44:3000',
      'http://192.168.0.44:3000',
      'http://127.0.0.1:8081',
      'http://localhost:8081',
    ];

    const isAllowedOrigin = (origin: string) => {
      // Très permissif pour le mobile
      if (!origin) return true; // Applications mobiles sans origin
      if (origin.includes('localhost')) return true;
      if (origin.includes('127.0.0.1')) return true;
      if (origin.includes('192.168.')) return true; // Toutes les IPs locales
      if (origin.includes('10.0.')) return true;
      return allowedOrigins.includes(origin);
    };

    app.enableCors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Origine CORS non autorisée: ${origin}`);
          callback(new Error('Non autorisé par CORS'));
        }
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'csrf-token'
      ],
      credentials: true,
      maxAge: 86400, // Cache preflight pendant 24h
    });

    // Test des images au démarrage
    try {
      const imagesPath = join(publicPath, 'images');
      const files = fs.readdirSync(imagesPath).slice(0, 3);
      console.log('🖼️ Test des images au démarrage:');
      files.forEach(file => {
        const filePath = join(imagesPath, file);
        const stats = fs.statSync(filePath);
        const testUrl = `http://192.168.100.187:3000/public/images/${file}`;
        console.log(`   ✅ ${file} (${stats.size} bytes) → ${testUrl}`);
      });
      console.log(`📊 Total: ${fs.readdirSync(imagesPath).length} images disponibles`);
    } catch (error: any) {
      console.log('❌ Erreur test images:', error.message);
    }
    
    const port = process.env.PORT || 3000;
    // Écouter sur toutes les interfaces pour permettre l'accès mobile et local
    await app.listen(port, '0.0.0.0');
    logger.log(`Application démarrée avec succès sur le port ${port}`);
    logger.log(`💻 Backend accessible sur: http://localhost:${port}`);
    logger.log(`💻 Backend accessible sur: http://127.0.0.1:${port}`);
    logger.log(`🌐 Frontend admin: http://localhost:3001`);
    logger.log(`📱 Mobile: Utilise l'IP du PC sur le réseau local`);
    logger.log(`📋 Configuration: Toutes interfaces (localhost + réseau local)`);
  } catch (error) {
    logger.error(`Erreur lors du démarrage de l'application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();