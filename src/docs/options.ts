import { DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Finops One API')
  .setContact('Finops One', '', 'polytech.projet.s10@gmail.com')
  .addServer('http://localhost:3000')
  .addServer('https://api.finopsone.home.didelo.fr')
  .setDescription('The Finops One API description')
  .setVersion('0.0.1')
  .addTag('home')
  .addTag('heroku')
  .build();

export { config };
