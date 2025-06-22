import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private isConfigured: boolean = false;

  constructor() {
    // Configuration automatique via CLOUDINARY_URL
    if (process.env.CLOUDINARY_URL) {
      console.log('✅ Cloudinary configuré via CLOUDINARY_URL');
      this.isConfigured = true;
    } else {
      console.log('⚠️ CLOUDINARY_URL non trouvé - Mode fallback activé');
      console.log('📋 Variables disponibles:', Object.keys(process.env).filter(key => key.includes('CLOUD')));
      this.isConfigured = false;
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'ranouma'): Promise<string> {
    // Vérifier si Cloudinary est configuré
    if (!process.env.CLOUDINARY_URL) {
      console.log('⚠️ CLOUDINARY_URL non disponible, échec de l\'upload');
      throw new Error('Cloudinary non configuré');
    }

    try {
      console.log(`📤 Upload vers Cloudinary: ${file.originalname}`);

      const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        folder: folder,
        resource_type: 'image',
        format: 'jpg', // Convertir en JPG pour optimiser
        quality: 'auto:good', // Optimisation automatique
      });

      console.log(`✅ Image uploadée: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error('❌ Erreur upload Cloudinary:', error);
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('❌ Erreur suppression Cloudinary:', error);
      return false;
    }
  }
}
