import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../domain/interfaces/user.repository.interface';

export interface PublicProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  section: string | null;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<PublicProfile> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      section: user.section ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
