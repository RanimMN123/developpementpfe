
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/PrismaModule';
import { CategoryModule } from './category/categoryModule';
import { ProductModule } from './admin/product/product.module';  // Import du ProductModule
import { ProductService } from './admin/product/product.service';
import { CategoryService } from './category/category.service';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { ClientController } from './client/client.controller'; // ← import ici
import { ClientService } from './client/client.service'; // ← import ici
import { ClientModule } from './client/client.module'; // ← import ici
import { FournisseurController } from './fournisseur/fournisseur.controller'; // ← import ici
import { FournisseurService } from './fournisseur/fournisseur.service'; // ← import ici
import { FournisseurModule } from './fournisseur/fournisseur.module'; // ← import ici
import { OrderModule } from './admin/order/order.module';
import { StatsModule } from './stats/stats.module';
import { DeliveryPlanningModule } from './delivery-planning/delivery-planning.module';
import { CaisseModule } from './caisse/caisse.module';
import { SecurityModule } from './security/security.module';
import { CsrfController } from './auth/csrf.controller';
@Module({
  imports: [
    SecurityModule, // Module de sécurité en premier
    StatsModule,
    OrderModule,
    ProductModule,
    ClientModule,
    FournisseurModule,
    AuthModule,
    UserModule,
    AdminModule,
    PrismaModule,
    CategoryModule,
    DeliveryPlanningModule,
    CaisseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',  // Clé plus sécurisée
      signOptions: {
        expiresIn: '1d',
        issuer: 'your-app-name',
        audience: 'your-app-users',
      },
    }),
    ProductModule
  ],
  controllers: [AppController, AdminController, ClientController, FournisseurController, CsrfController],
  providers: [AppService, CategoryService, ProductService, AdminService, ClientService, FournisseurService],
})
export class AppModule {}
