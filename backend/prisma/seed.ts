import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin existe déjà:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        createdAt: existingAdmin.createdAt
      });
    } else {
      // Créer l'admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.admin.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
        },
      });

      console.log('✅ Admin créé avec succès !');
      console.log('Détails:', {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt
      });
    }

    console.log('');
    console.log('🔐 Identifiants de connexion :');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: admin123');
    console.log('');
    console.log('🌐 Connectez-vous sur : http://localhost:3001/login');
    console.log('');
    console.log('🌱 Seeding terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
