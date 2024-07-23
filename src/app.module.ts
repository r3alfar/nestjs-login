import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AuthController } from './auth/auth.controller';
// import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),

  ],
  // controllers: [AuthController],
  // providers: [AuthService],
})
export class AppModule { }
