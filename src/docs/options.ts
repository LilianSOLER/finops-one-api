import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Configuration for Swagger documentation.
 */
const config = new DocumentBuilder()
  .setTitle('Finops One API') // Title of the API
  .setContact('Finops One', '', 'polytech.projet.s10@gmail.com') // Contact information
  .addServer('http://localhost:3000') // Local development server
  .addServer('https://api.finopsone.home.didelo.fr') // Production server
  .setDescription('The Finops One API description') // Description of the API
  .setVersion('0.0.1') // API version
  .addTag('home') // Tags for different sections of the API
  .addTag('auth')
  .addTag('users')
  .addTag('projects')
  .addTag('companies')
  .addBearerAuth() // Enable bearer token authentication
  .build(); // Build the configuration

export { config };
