import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class ShowBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

// TODO: futuramente adicionar aqui a tipagem das Transactions
export class ShowBankAccountOutputDto extends BankAccountEntity {}
