import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class DeactivateBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class DeactivateBankAccountOutputDto extends BankAccountEntity {}
