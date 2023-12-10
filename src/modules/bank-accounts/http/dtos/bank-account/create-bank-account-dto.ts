import { ApiProperty } from '@nestjs/swagger'
import { BankAccountType } from '@prisma/client'
import { IsNotEmpty, IsString, IsEnum } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class CreateBankAccountInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agency: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BankAccountType)
  type: BankAccountType
}

export class CreateBankAccountOutputDto extends BankAccountEntity {}
