import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule,);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true
  })
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close())
  }
}
bootstrap();
