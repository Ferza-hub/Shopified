import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { AuthTokens, AuthUser, JwtPayload } from '@shopified/shared';
import { uniqueSlug } from '@shopified/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = await this.generateStoreSlug(dto.storeName);

    const { user, store, role } = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });

      const createdStore = await tx.store.create({
        data: {
          name: dto.storeName,
          slug,
          email: dto.email,
          settings: { create: {} },
          users: {
            create: {
              userId: createdUser.id,
              role: 'OWNER',
            },
          },
        },
      });

      return { user: createdUser, store: createdStore, role: 'OWNER' as const };
    });

    const tokens = await this.issueTokens(user, store.id, role);
    return { user: this.toAuthUser(user, store.id, role), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const membership = await this.prisma.storeUser.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    const storeId = membership?.storeId;
    const role = membership?.role;
    const tokens = await this.issueTokens(user, storeId, role);
    return { user: this.toAuthUser(user, storeId, role), tokens };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return null;
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active');
    }

    // Rotate the refresh token.
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(user, payload.storeId, payload.role);
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { success: true };
  }

  private async issueTokens(
    user: User,
    storeId?: string,
    role?: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      storeId,
      role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });

    const expiresAt = this.computeRefreshExpiry();
    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private computeRefreshExpiry(): Date {
    const expr = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const match = /^(\d+)([smhd])$/.exec(expr.trim());
    const now = Date.now();
    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(now + value * multipliers[unit]);
  }

  private async generateStoreSlug(name: string): Promise<string> {
    const existing = await this.prisma.store.findMany({
      select: { slug: true },
    });
    return uniqueSlug(name, existing.map((s) => s.slug));
  }

  private toAuthUser(user: User, storeId?: string, role?: string): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      storeId,
      role,
    };
  }
}
