import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token for obtaining new access token' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
