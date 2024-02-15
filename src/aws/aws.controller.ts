import { Controller,Get, Body, Post, InternalServerErrorException, Delete, Put } from "@nestjs/common";
import { AwsService } from "./aws.service";
import { CredentialDto } from "./dto/credential.dto";
import type { Metric } from "./types";
import {Cron,CronExpression} from "@nestjs/schedule";
import { RemoveCredentialDto } from "./dto/rm-credential.dto";

@Controller('aws')
export class AwsController{

    constructor(private awsService : AwsService){}
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    //@Get() //je le commente pour que l'action soit effectuer tous les jours mais pas sur demande de l'utilisateur
    async getCost(){
        const result = await this.awsService.getCost();
        return result;
    }
    // l"utilisateur récupère seulement les données de la base de données
    @Get()
    async getMetrics(){
        const res = await this.awsService.getMetrics();
        return res;
    }

    //ajouter une fonction getCost pour un projet en particulier
    
    @Post('credentials')
    async addCredentials(@Body() dto : CredentialDto){
        const result = await this.awsService.addCredentials(dto);
        console.log(result);
        return result;
    }
    
    @Get('credentials')
    async getCredentials(){
        const result = await this.awsService.getCredentials();
        console.log(result);
        return result;
    }


    @Put('credentials')
    async updateCredential(@Body() dto : CredentialDto){
        return await this.awsService.updateCredentials(dto);
    }

    @Delete('credentials') 
    async removeCredentials(@Body() dto : RemoveCredentialDto){
        return await this.awsService.removeCredential(dto);
    } 


}