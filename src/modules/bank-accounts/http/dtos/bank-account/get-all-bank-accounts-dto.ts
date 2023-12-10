import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, Min } from 'class-validator'

import { BankAccountEntity } from '@src/modules/bank-accounts/domain/entities/bank-account.entity'

export class GetAllBankAccountsInputDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize?: number
}

export class GetAllBankAccountsOutputDto {
  @ApiProperty({ type: BankAccountEntity, isArray: true })
  bankAccounts: BankAccountEntity[]

  @ApiProperty()
  page?: number

  @ApiProperty()
  pageSize?: number

  @ApiProperty()
  total?: number

  @ApiProperty()
  pageCount?: number
}
