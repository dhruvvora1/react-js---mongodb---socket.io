import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.enableCors();
  const config = new DocumentBuilder()
    .setTitle("Ticket App")
    .setDescription("Ticket Api")
    .setVersion("1.0.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token"
    )
    .addSecurityRequirements("access-token")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));

  SwaggerModule.setup("swagger-api", app, document);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  await app.listen(4000);
}
bootstrap();
