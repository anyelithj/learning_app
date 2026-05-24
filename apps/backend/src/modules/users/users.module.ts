import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { USER_REPOSITORY } from './domain/interfaces/user.repository.interface';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UsersController } from './presentation/users.controller';
// [Módulo Users]: Bounded Context que encapsula gestión de usuarios | [Patrón]: Module | [Principio]: ISP + DIP | [Paradigma]: POO

// [Provider con token simbólico]: Application depende de USER_REPOSITORY (Port), no de UserRepository (Adapter) | [Patrón]: DI Token
const userRepositoryProvider = {
  provide: USER_REPOSITORY,
  useClass: UserRepository,
};

@Module({
  // [TypeOrm feature]: registra entidad User para que @InjectRepository funcione
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [userRepositoryProvider],
  // [Exports]: Auth module necesita el repo para validar credenciales
  exports: [userRepositoryProvider, TypeOrmModule],
})
export class UsersModule {}
