import {
  Controller,
  Get,
  Body,
  Post,
  InternalServerErrorException,
  Delete,
  Put,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { CredentialDto } from './dto/credential.dto';
import type { Metric } from './types';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemoveCredentialDto } from './dto/rm-credential.dto';

@Controller('aws')
export class AwsController {
  constructor(private awsService: AwsService) {}
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  
  async getCost() {
    return await this.awsService.getCost();
  }
  // l"utilisateur récupère seulement les données de la base de données
  @Get()
  async getMetrics() {
    return await this.awsService.getMetrics();
  }

  @Get('serviceCost')
  async getServiceCost() {
    return await this.awsService.getCostServices();
  }

  //ajouter une fonction getCost pour un projet en particulier

  @Post('credentials')
  async addCredentials(@Body() dto: CredentialDto) {
    return await this.awsService.addCredentials(dto);
  
  }

  @Get('credentials')
  async getCredentials() {
    return await this.awsService.getCredentials();
  }

  @Put('credentials')
  async updateCredential(@Body() dto: CredentialDto) {
    return await this.awsService.updateCredentials(dto);
  }

  @Delete('credentials')
  async removeCredentials(@Body() dto: RemoveCredentialDto) {
    return await this.awsService.removeCredential(dto);
  }
}
