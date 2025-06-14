import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function generateAndUpdatePassword() {
  const email = 'admin@example.com'; // L'email de l'admin à mettre à jour
  const password = 'admin123'; // Le mot de passe brut que tu veux tester

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Mot de passe haché:', hashedPassword);

  // Mise à jour du mot de passe dans la base de données
  await prisma.admin.update({
    where: { email }, // Recherche l'admin avec cet email
    data: { password: hashedPassword }, // Mets à jour le mot de passe avec le hash
  });

  console.log('Mot de passe mis à jour avec succès !');
}

generateAndUpdatePassword().catch(console.error).finally(() => prisma.$disconnect());
