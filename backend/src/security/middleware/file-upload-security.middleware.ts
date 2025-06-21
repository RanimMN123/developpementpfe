import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../security.service';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadSecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(FileUploadSecurityMiddleware.name);
  
  // Types MIME autorisés
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  // Extensions autorisées
  private readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
  ];

  // Taille maximale des fichiers (10MB)
  private readonly maxFileSize = 10 * 1024 * 1024;

  // Signatures de fichiers (magic numbers) pour validation
  private readonly fileSignatures = new Map([
    ['image/jpeg', [0xFF, 0xD8, 0xFF]],
    ['image/png', [0x89, 0x50, 0x4E, 0x47]],
    ['image/gif', [0x47, 0x49, 0x46]],
    ['image/webp', [0x52, 0x49, 0x46, 0x46]],
  ]);

  constructor(private readonly securityService: SecurityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Appliquer seulement aux routes d'upload
    if (!this.isUploadRoute(req)) {
      return next();
    }

    // Vérifier la taille de la requête
    const contentLength = parseInt(req.get('content-length') || '0');
    if (contentLength > this.maxFileSize) {
      this.logger.warn(`Fichier trop volumineux: ${contentLength} bytes`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      throw new BadRequestException('Fichier trop volumineux');
    }

    // Intercepter les données du fichier
    this.interceptFileData(req, res, next);
  }

  private isUploadRoute(req: Request): boolean {
    const uploadRoutes = [
      '/products',
      '/categories',
      '/admin/products',
      '/admin/categories',
    ];

    return uploadRoutes.some(route => req.path.includes(route)) && 
           req.method === 'POST';
  }

  private interceptFileData(req: Request, res: Response, next: NextFunction) {
    const originalEnd = res.end;
    const chunks: Buffer[] = [];

    // Intercepter les données
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      
      // Vérifier la taille en temps réel
      const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      if (totalSize > this.maxFileSize) {
        this.logger.warn('Fichier trop volumineux détecté pendant l\'upload', {
          ip: req.ip,
          path: req.path,
          size: totalSize,
        });
        req.destroy();
        throw new BadRequestException('Fichier trop volumineux');
      }
    });

    req.on('end', () => {
      if (chunks.length > 0) {
        const buffer = Buffer.concat(chunks);
        this.validateFileContent(buffer, req);
      }
    });

    next();
  }

  private validateFileContent(buffer: Buffer, req: Request) {
    try {
      // Détecter le type MIME réel du fichier
      const detectedMimeType = this.detectMimeType(buffer);
      
      if (!detectedMimeType) {
        this.logger.warn('Type de fichier non reconnu', {
          ip: req.ip,
          path: req.path,
          bufferStart: buffer.slice(0, 10).toString('hex'),
        });
        throw new BadRequestException('Type de fichier non supporté');
      }

      // Vérifier si le type MIME est autorisé
      if (!this.allowedMimeTypes.includes(detectedMimeType)) {
        this.logger.warn(`Type MIME non autorisé: ${detectedMimeType}`, {
          ip: req.ip,
          path: req.path,
        });
        throw new BadRequestException('Type de fichier non autorisé');
      }

      // Vérifier la signature du fichier
      if (!this.validateFileSignature(buffer, detectedMimeType)) {
        this.logger.warn('Signature de fichier invalide', {
          ip: req.ip,
          path: req.path,
          detectedType: detectedMimeType,
        });
        throw new BadRequestException('Fichier corrompu ou invalide');
      }

      // Analyser le contenu pour détecter du code malveillant
      this.scanForMaliciousContent(buffer, req);

    } catch (error) {
      this.logger.error('Erreur lors de la validation du fichier', {
        error: error.message,
        ip: req.ip,
        path: req.path,
      });
      throw error;
    }
  }

  private detectMimeType(buffer: Buffer): string | null {
    // Vérifier les signatures de fichiers
    for (const [mimeType, signature] of this.fileSignatures.entries()) {
      if (this.matchesSignature(buffer, signature)) {
        return mimeType;
      }
    }

    // Vérifications supplémentaires pour SVG
    if (buffer.toString('utf8', 0, 100).includes('<svg')) {
      return 'image/svg+xml';
    }

    return null;
  }

  private matchesSignature(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  private validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    const signature = this.fileSignatures.get(mimeType);
    
    if (!signature) {
      // Pour les types sans signature définie (comme SVG), on fait une validation basique
      return mimeType === 'image/svg+xml' ? this.validateSvg(buffer) : true;
    }

    return this.matchesSignature(buffer, signature);
  }

  private validateSvg(buffer: Buffer): boolean {
    const content = buffer.toString('utf8');
    
    // Vérifier que c'est bien un SVG valide
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      return false;
    }

    // Détecter du JavaScript dans le SVG
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(content));
  }

  private scanForMaliciousContent(buffer: Buffer, req: Request) {
    const content = buffer.toString('utf8');

    // Patterns de contenu malveillant
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /data:text\/html/gi,
      /<?php/gi,
      /<\?=/gi,
      /<%/gi,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        this.logger.warn('Contenu malveillant détecté dans le fichier', {
          ip: req.ip,
          path: req.path,
          pattern: pattern.toString(),
        });
        throw new BadRequestException('Contenu de fichier non autorisé');
      }
    }
  }

  /**
   * Génère un nom de fichier sécurisé
   */
  static generateSecureFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Valide un nom de fichier
   */
  static validateFileName(fileName: string): boolean {
    // Caractères interdits
    const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
    
    // Noms réservés Windows
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    
    return !forbiddenChars.test(fileName) && 
           !reservedNames.test(fileName) && 
           fileName.length <= 255;
  }
}
