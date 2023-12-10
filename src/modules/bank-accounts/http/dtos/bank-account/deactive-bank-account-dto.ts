import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class UpdateBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class UpdateBankAccountOutputDto extends BankAccountEntity {}
