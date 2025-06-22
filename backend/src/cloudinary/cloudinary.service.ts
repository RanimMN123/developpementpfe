import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private isConfigured: boolean = false;

  constructor() {
    // Configuration explicite de Cloudinary
    if (process.env.CLOUDINARY_URL) {
      try {
        // Configuration explicite avec l'URL
        cloudinary.config({
          cloudinary_url: process.env.CLOUDINARY_URL
        });

        console.log('✅ Cloudinary configuré explicitement');
        console.log('🔗 URL utilisée:', process.env.CLOUDINARY_URL.substring(0, 30) + '...');
        this.isConfigured = true;

        // Test de la configuration
        console.log('🧪 Test configuration Cloudinary...');
        cloudinary.api.ping().then(() => {
          console.log('✅ Cloudinary ping réussi !');
        }).catch((error) => {
          console.log('❌ Cloudinary ping échoué:', error.message);
        });

      } catch (error) {
        console.error('❌ Erreur configuration Cloudinary:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️ CLOUDINARY_URL non trouvé - Mode fallback activé');
      console.log('📋 Variables disponibles:', Object.keys(process.env).filter(key => key.includes('CLOUD')));
      this.isConfigured = false;
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'ranouma'): Promise<string> {
    // Vérifier si Cloudinary est configuré
    if (!this.isConfigured || !process.env.CLOUDINARY_URL) {
      console.log('⚠️ Cloudinary non configuré, échec de l\'upload');
      throw new Error('Cloudinary non configuré');
    }

    try {
      console.log(`📤 Début upload vers Cloudinary...`);
      console.log(`📁 Fichier: ${file.originalname} (${file.size} bytes)`);
      console.log(`📂 Dossier: ${folder}`);

      const uploadOptions = {
        folder: folder,
        resource_type: 'image' as const,
        format: 'jpg', // Convertir en JPG pour optimiser
        quality: 'auto:good', // Optimisation automatique
      };

      console.log('🔧 Options upload:', uploadOptions);

      const result = await cloudinary.uploader.upload(
        file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        uploadOptions
      );

      console.log(`✅ Upload réussi !`);
      console.log(`🔗 URL: ${result.secure_url}`);
      console.log(`📊 Taille: ${result.bytes} bytes`);

      return result.secure_url;
    } catch (error) {
      console.error('❌ Erreur détaillée upload Cloudinary:');
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      throw new Error(`Erreur upload Cloudinary: ${error.message}`);
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
