import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID, Min } from 'class-validator'
import { Type } from 'class-transformer'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class WithdrawBankAccountInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  value: number
}

export class WithdawBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class WithdrawBankAccountOutputDto extends BankAccountEntity {}
