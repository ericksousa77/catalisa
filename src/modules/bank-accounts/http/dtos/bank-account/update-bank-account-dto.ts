import { ApiProperty } from '@nestjs/swagger'
import { BankAccountType } from '@prisma/client'
import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator'

export class UpdateBankAccountInputDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  agency?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(BankAccountType)
  type?: BankAccountType
}

export class UpdateBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class UpdateBankAccountOutputDto extends BankAccountEntity {}
