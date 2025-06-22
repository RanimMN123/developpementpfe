import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private isConfigured: boolean = false;

  constructor() {
    // Essayer d'abord CLOUDINARY_URL, puis les variables séparées
    if (process.env.CLOUDINARY_URL) {
      try {
        cloudinary.config({
          cloudinary_url: process.env.CLOUDINARY_URL
        });
        console.log('✅ Cloudinary configuré avec CLOUDINARY_URL');
        this.isConfigured = true;
      } catch (error) {
        console.error('❌ Erreur avec CLOUDINARY_URL:', error);
        this.isConfigured = false;
      }
    } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        console.log('✅ Cloudinary configuré avec variables séparées');
        console.log('☁️ Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
        this.isConfigured = true;
      } catch (error) {
        console.error('❌ Erreur avec variables séparées:', error);
        this.isConfigured = false;
      }
    } else {
      // Configuration manuelle en dur (temporaire pour test)
      try {
        cloudinary.config({
          cloud_name: 'dvwoekbmv',
          api_key: '388133234968652',
          api_secret: 'bxUBrKi3zG5AXV-kRlP0XCAMw1Q',
        });
        console.log('✅ Cloudinary configuré manuellement (temporaire)');
        console.log('🔧 Configuration appliquée:', {
          cloud_name: 'dvwoekbmv',
          api_key: '388133234968652',
          api_secret: 'bxU***' // Masqué pour sécurité
        });
        this.isConfigured = true;

        // Test immédiat de la configuration
        console.log('🧪 Test ping Cloudinary...');
        cloudinary.api.ping().then(() => {
          console.log('✅ Ping Cloudinary réussi !');
        }).catch((pingError) => {
          console.log('❌ Ping Cloudinary échoué:', pingError.message);
        });

      } catch (error) {
        console.log('❌ Erreur configuration manuelle:', error);
        console.log('📋 Variables env disponibles:', Object.keys(process.env).filter(key => key.toLowerCase().includes('cloud')));
        this.isConfigured = false;
      }
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'ranouma'): Promise<string> {
    // Vérifier si Cloudinary est configuré
    console.log('🔍 Vérification configuration Cloudinary...');
    console.log('   - isConfigured:', this.isConfigured);
    console.log('   - CLOUDINARY_URL exists:', !!process.env.CLOUDINARY_URL);

    if (!this.isConfigured) {
      console.log('❌ Cloudinary non configuré, échec de l\'upload');
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
