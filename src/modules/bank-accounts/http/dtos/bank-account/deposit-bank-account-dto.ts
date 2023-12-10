import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID, Min } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'
import { Type } from 'class-transformer'

export class DepositBankAccountInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  value: number
}

export class DepositBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class DepositBankAccountOutputDto extends BankAccountEntity {}
