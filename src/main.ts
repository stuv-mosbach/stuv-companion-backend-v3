import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: "*",
  });
  const port = configService.get("PORT") || 3000;

  const config = new DocumentBuilder()
    .setTitle('StuV.app API')
    .setDescription('The DHBW Mosbach Lectures API')
    .setVersion('1.0')
    .addTag('stuv')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
