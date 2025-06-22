import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Configuration automatique via CLOUDINARY_URL
    if (process.env.CLOUDINARY_URL) {
      console.log('✅ Cloudinary configuré via CLOUDINARY_URL');
    } else {
      console.log('⚠️ CLOUDINARY_URL non trouvé');
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'ranouma'): Promise<string> {
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
