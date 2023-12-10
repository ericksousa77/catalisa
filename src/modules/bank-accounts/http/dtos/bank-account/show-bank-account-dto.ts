import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { TransactionType } from '@prisma/client'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

class Transaction {
  @ApiProperty()
  id: string

  @ApiProperty()
  type: TransactionType

  @ApiProperty()
  value: number

  @ApiProperty()
  bankAccountId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  code: number
}
export class ShowBankAccountParamInputDto {
  @ApiProperty()
  @IsUUID()
  bankAccountId: string
}

export class ShowBankAccountOutputDto extends BankAccountEntity {
  @ApiProperty({ type: Transaction, isArray: true })
  Transactions?: Transaction[]
}
