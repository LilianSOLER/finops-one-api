import { ForbiddenException, Injectable, Response } from "@nestjs/common";
//const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';
import { CredentialDto } from "./dto/credential.dto";
import {PrismaService} from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const credentials = {
    access_key : 'AKIA5FTZCBQ64VG6W5S2',
    secret_key : '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'
}


@Injectable({})
export class AwsService{


    constructor(
        private prismaService : PrismaService
    ){
        AWS.config.update({
            accessKeyId: credentials.access_key,
            secretAccessKey: credentials.secret_key,
            region: 'eu-west-3'
        })
    }


    getCost(){

        //ajouter ici le code de permettant de récupérer uniquement les informations correspondant au compte lié
        const ce = new AWS.CostExplorer();

        const params = {
            TimePeriod: {
                Start: '2024-02-01',
                End: '2024-02-08'
            },
            Granularity: 'DAILY',
            GroupBy : [{"Type" : "DIMENSION", "Key" :"SERVICE"}],
            Metrics: ['BLENDED_COST','USAGE_QUANTITY','AMORTIZED_COST','NET_AMORTIZED_COST','NET_UNBLENDED_COST','NORMALIZED_USAGE_AMOUNT','UNBLENDED_COST']
        };

        const data = ce.getCostAndUsage(params, (err: Error| null, data :  AWS.CostExplorer.GetCostAndUsageResponse) => {
            if (err) {
                console.error(err, err.stack);
            } else {
                //console.log(data);
                return data;
            }
        });

        return data.promise();

    }

    async addCredentials(dto : CredentialDto){
        const date = new Date();

        try{
            const res = await this.prismaService.aws_credentials.create({
                data : {
                    //createAt : date.getDay().toString(),
                    accessKeyId : dto.accessKeyId,
                    secretAccessKey : dto.secretAccessKey
                },
            });
    
            console.log(res);
    
            if(res){
                return res;
            }
        }catch(err){
            if( err instanceof PrismaClientKnownRequestError){
                if(err.code === 'P2002'){
                    throw new ForbiddenException('this access key already exist in DB');
                }
            }
            throw err;
        }
        
    }

    

    async getCredentials(){
        
        const res = await this.prismaService.aws_credentials.findMany();
        if(res){
            return res;
        }
    }

}