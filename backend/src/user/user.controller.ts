import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { LoginDto } from './login.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/revenue')
  async getUserRevenue(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserRevenue(id);
  }

  @Get(':id/orders')
  async getOrdersByUser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getOrdersByUser(userId);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return user;
  }



  // Add this method to your UserController class

@Get(':id/clients')
async getClientsByUser(@Param('id', ParseIntPipe) userId: number) {
  return this.userService.getClientsByUser(userId);
}

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletedUser = await this.userService.remove(id);
    if (!deletedUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return { message: `Utilisateur avec l'ID ${id} supprimé` };
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }
}

