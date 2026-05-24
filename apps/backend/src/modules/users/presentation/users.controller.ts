import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../domain/value-objects/role.vo';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../domain/interfaces/user.repository.interface';

// [DTO Create User]: input ADMIN para crear usuarios | [Patrón]: DTO | [Principio]: SRP
export class AdminCreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}

// [DTO Update User]: editable por ADMIN | [Patrón]: DTO Partial
export class AdminUpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @ApiProperty({ required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
// [Controller Users]: lectura para ADMIN | [Patron]: Controller (MVC) | [Principio]: SRP

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
  ) {}

  // [GET /users]: lista paginada — solo ADMIN | [Patrón]: Pagination
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (ADMIN) paginated' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: Role,
    @Query('search') search?: string,
  ) {
    const result = await this.repo.listAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      role,
      search,
    });
    // [Sanea sensibles]: no devolver passwordHash al cliente | [Principio]: Least Privilege
    return {
      ...result,
      data: result.data.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt,
      })),
    };
  }

  // [GET /users/stats]: agregados para Reportes ADMIN
  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Aggregate user stats (ADMIN)' })
  async stats() {
    const byRole = await this.repo.countByRole();
    const total = Object.values(byRole).reduce((s, n) => s + n, 0);
    return { total, byRole };
  }

  // [GET /users/:id]: detalle de usuario | [Principio]: SRP
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by id (ADMIN)' })
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }

  // [POST /users]: crear usuario | [Patrón]: Command | [Principio]: SRP
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user (ADMIN)' })
  async create(@Body() dto: AdminCreateUserDto) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email ya registrado');
    // [Hash password]: bcrypt saltRounds=12 igual que registro estándar | [Principio]: SSOT
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.repo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role: dto.role,
    });
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }

  // [PATCH /users/:id]: editar usuario | [Patrón]: Command
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (ADMIN)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Nothing to update');
    }
    const user = await this.repo.update(id, dto);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }

  // [DELETE /users/:id]: soft disable | [Patrón]: Soft Delete
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user (soft, ADMIN)' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.repo.deactivate(id);
  }

  // [POST /users/:id/activate]: re-habilitar usuario | [Patrón]: Command
  @Post(':id/activate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reactivate user (ADMIN)' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.repo.reactivate(id);
  }
}
