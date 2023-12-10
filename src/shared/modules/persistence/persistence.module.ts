import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@src/shared/modules/config/config.module'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PersistenceModule {}
