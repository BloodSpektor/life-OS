import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password } = registerDto;

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Проверяем, существует ли пользователь с таким телефоном
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException('Пользователь с таким номером телефона уже существует');
      }
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Генерируем JWT токен
    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrPhone, password } = loginDto;

    // Ищем пользователя по email или телефону
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Генерируем JWT токен
    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }
}
