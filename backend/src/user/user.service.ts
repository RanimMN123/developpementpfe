import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto'; // Import du LoginDto

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, // ✅ injection du JwtService
  ) {}

  async create(data: CreateUserDto) {
    // Hacher le mot de passe avant de créer l'utilisateur
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    if (!id) {
      throw new Error('ID est requis pour findOne');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  // Add this method to your UserService class

async getClientsByUser(userId: number) {
  // First verify the user exists
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
  }

  // Get all clients belonging to this user
  const clients = await this.prisma.client.findMany({
    where: { userId },
  });

  return clients;
}

  async update(id: number, data: UpdateUserDto) {
    if (!id) {
      throw new Error('ID est requis pour update');
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};

    // Copier les champs non-password
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.telephone !== undefined) {
      updateData.telephone = data.telephone;
    }
    if (data.adresse !== undefined) {
      updateData.adresse = data.adresse;
    }
    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    // Hacher le mot de passe s'il est fourni
    if (data.password !== undefined && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async remove(id: number) {
    if (!id) {
      throw new Error('ID est requis pour remove');
    }

    const user = await this.prisma.user.delete({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async signup(dto: CreateUserDto) {
    // Vérifie si l'email est déjà utilisé
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,

      },
    });
  }


  // Pour calculer le revenu total d’un utilisateur
async getUserRevenue(userId: number) {
  const orders = await this.prisma.order.findMany({
    where: { client: { userId } },
    include: { items: { include: { product: true } } },
  });

  const totalRevenue = orders.reduce((sum, order) => {
    const total = order.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
    return sum + total;
  }, 0);

  return { totalRevenue };
}

// Pour récupérer les commandes avec le total
async getOrdersByUser(userId: number) {
  const orders = await this.prisma.order.findMany({
    where: { client: { userId } },
    select: {
      id: true,
      status: true,
      createdAt: true,
      items: {
        include: {
          product: { select: { price: true } },
        },
      },
    },
  });

  return orders.map((order) => {
    const total = order.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    return {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      total,
    };
  });
}


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload); // Création du token JWT
    return { token };
  }
}
