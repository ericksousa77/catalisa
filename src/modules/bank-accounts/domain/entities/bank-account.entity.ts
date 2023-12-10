import { ApiProperty } from '@nestjs/swagger'
import { BankAccountType } from '@prisma/client'
import { randomUUID } from 'crypto'

export type BankAccountEntityProps = Pick<
  BankAccountEntity,
  'agency' | 'accountNumber' | 'type' | 'balance' | 'isActive'
>

type GeneratedBankAccountProps = {
  id: string
  createdAt: Date
  updatedAt: Date
}

export class BankAccountEntity {
  @ApiProperty()
  readonly id: string

  @ApiProperty()
  accountNumber?: number

  @ApiProperty()
  agency: string

  @ApiProperty()
  type: BankAccountType

  @ApiProperty()
  balance: number

  @ApiProperty()
  isActive?: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(data: BankAccountEntityProps & GeneratedBankAccountProps) {
    Object.assign(this, data)
  }

  static create(
    data: BankAccountEntityProps,
    id = randomUUID()
  ): BankAccountEntity {
    return new BankAccountEntity({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}
