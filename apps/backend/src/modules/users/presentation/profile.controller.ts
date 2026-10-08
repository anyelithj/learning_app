import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../../../shared/decorators/current-user.decorator';
import { GetProfileUseCase } from '../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { GetUserHistoryUseCase } from '../application/use-cases/get-user-history.use-case';
import { DeleteAccountUseCase } from '../application/use-cases/delete-account.use-case';

export class UpdateProfileDto {
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

  @ApiProperty({ required: false, example: '11-1' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  section?: string;
}

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileUC: GetProfileUseCase,
    private readonly updateProfileUC: UpdateProfileUseCase,
    private readonly getHistoryUC: GetUserHistoryUseCase,
    private readonly deleteAccountUC: DeleteAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.getProfileUC.execute(user.sub);
  }

  @Get('me/history')
  @ApiOperation({ summary: 'Get own profile with history data' })
  async getMyHistory(@CurrentUser() user: JwtPayload) {
    return this.getHistoryUC.execute(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile (firstName, lastName, section)' })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUC.execute(user.sub, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate own account (soft delete)' })
  async deleteMyAccount(@CurrentUser() user: JwtPayload) {
    await this.deleteAccountUC.execute(user.sub);
  }
}
