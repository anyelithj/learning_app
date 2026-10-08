import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../domain/interfaces/user.repository.interface';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  section?: string | null;
}

export interface UpdateProfileResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  section: string | null;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
  ) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const existing = await this.repo.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    const partial: Record<string, unknown> = {};
    if (input.firstName !== undefined) partial.firstName = input.firstName.trim();
    if (input.lastName !== undefined) partial.lastName = input.lastName.trim();
    if (input.section !== undefined) partial.section = input.section?.trim() || null;

    const updated = await this.repo.update(userId, partial);
    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role,
      section: updated.section ?? null,
    };
  }
}
