import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Response } from "@nestjs/common";
//const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';
import { CredentialDto } from "./dto/credential.dto";
import {PrismaService} from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Metric, MetricGroupeBy } from "./types";
import { RemoveCredentialDto } from "./dto/rm-credential.dto";



const credentials = {
    access_key : 'AKIA5FTZCBQ64VG6W5S2',
    secret_key : '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'
}
function hier(date : Date) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

const debug_data = {"GroupDefinitions":[{"Type":"DIMENSION","Key":"SERVICE"}],"ResultsByTime":[{"TimePeriod":{"Start":"2024-02-01","End":"2024-02-02"},"Total":{},"Groups":[{"Keys":["AWS Service Catalog"],"Metrics":{"AmortizedCost":{"Amount":"0","Unit":"USD"},"BlendedCost":{"Amount":"0","Unit":"USD"},"NetAmortizedCost":{"Amount":"0","Unit":"USD"},"NetUnblendedCost":{"Amount":"0","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0","Unit":"USD"},"UsageQuantity":{"Amount":"1","Unit":"N/A"}}},{"Keys":["Tax"],"Metrics":{"AmortizedCost":{"Amount":"0.07","Unit":"USD"},"BlendedCost":{"Amount":"0.07","Unit":"USD"},"NetAmortizedCost":{"Amount":"0.07","Unit":"USD"},"NetUnblendedCost":{"Amount":"0.07","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0.07","Unit":"USD"},"UsageQuantity":{"Amount":"0","Unit":"N/A"}}}],"Estimated":true},{"TimePeriod":{"Start":"2024-02-02","End":"2024-02-03"},"Total":{},"Groups":[{"Keys":["AWS Systems Manager"],"Metrics":{"AmortizedCost":{"Amount":"0.000039","Unit":"USD"},"BlendedCost":{"Amount":"0.000039","Unit":"USD"},"NetAmortizedCost":{"Amount":"0.000039","Unit":"USD"},"NetUnblendedCost":{"Amount":"0.000039","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0.000039","Unit":"USD"},"UsageQuantity":{"Amount":"1","Unit":"N/A"}}}],"Estimated":true},{"TimePeriod":{"Start":"2024-02-03","End":"2024-02-04"},"Total":{"AmortizedCost":{"Amount":"0","Unit":"USD"},"BlendedCost":{"Amount":"0","Unit":"USD"},"NetAmortizedCost":{"Amount":"0","Unit":"USD"},"NetUnblendedCost":{"Amount":"0","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0","Unit":"USD"},"UsageQuantity":{"Amount":"0","Unit":"N/A"}},"Groups":[],"Estimated":true},{"TimePeriod":{"Start":"2024-02-04","End":"2024-02-05"},"Total":{},"Groups":[{"Keys":["AWS Cost Explorer"],"Metrics":{"AmortizedCost":{"Amount":"0.04","Unit":"USD"},"BlendedCost":{"Amount":"0.04","Unit":"USD"},"NetAmortizedCost":{"Amount":"0.04","Unit":"USD"},"NetUnblendedCost":{"Amount":"0.04","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0.04","Unit":"USD"},"UsageQuantity":{"Amount":"4","Unit":"N/A"}}}],"Estimated":true},{"TimePeriod":{"Start":"2024-02-05","End":"2024-02-06"},"Total":{},"Groups":[{"Keys":["AWS Cost Explorer"],"Metrics":{"AmortizedCost":{"Amount":"0.3","Unit":"USD"},"BlendedCost":{"Amount":"0.3","Unit":"USD"},"NetAmortizedCost":{"Amount":"0.3","Unit":"USD"},"NetUnblendedCost":{"Amount":"0.3","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0.3","Unit":"USD"},"UsageQuantity":{"Amount":"30","Unit":"N/A"}}}],"Estimated":true},{"TimePeriod":{"Start":"2024-02-06","End":"2024-02-07"},"Total":{"AmortizedCost":{"Amount":"0","Unit":"USD"},"BlendedCost":{"Amount":"0","Unit":"USD"},"NetAmortizedCost":{"Amount":"0","Unit":"USD"},"NetUnblendedCost":{"Amount":"0","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0","Unit":"USD"},"UsageQuantity":{"Amount":"0","Unit":"N/A"}},"Groups":[],"Estimated":true},{"TimePeriod":{"Start":"2024-02-07","End":"2024-02-08"},"Total":{"AmortizedCost":{"Amount":"0","Unit":"USD"},"BlendedCost":{"Amount":"0","Unit":"USD"},"NetAmortizedCost":{"Amount":"0","Unit":"USD"},"NetUnblendedCost":{"Amount":"0","Unit":"USD"},"NormalizedUsageAmount":{"Amount":"0","Unit":"N/A"},"UnblendedCost":{"Amount":"0","Unit":"USD"},"UsageQuantity":{"Amount":"0","Unit":"N/A"}},"Groups":[],"Estimated":true}],"DimensionValueAttributes":[]}

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
    

   async getCost(){

        //ajouter ici le code de permettant de récupérer uniquement les informations correspondant au compte lié
        const ce = new AWS.CostExplorer();

        //retrieve and update aws credentials and set it depending on which project belong the user
        //ajouter tout ça dans un boucle qui l'effectue pour tous les projets

        //set the query (date)
        const ajd = new Date();
        const Hier = hier(ajd);

        console.log("Retrieve datas from : ",Hier.toISOString().split("T")[0] ," to ", ajd.toISOString().split("T")[0]);

        const params = {
            TimePeriod: {
                Start: Hier.toISOString().split("T")[0],
                End: ajd.toISOString().split('T')[0]
            },
        // const params = {
        //     TimePeriod: {
        //         Start: "2024-02-01",
        //         End: ajd.toISOString().split('T')[0]
        //     },

            Granularity: 'DAILY',
            GroupBy : [{"Type" : "DIMENSION", "Key" :"SERVICE"}],
            Metrics: ['BLENDED_COST','USAGE_QUANTITY','AMORTIZED_COST','NET_AMORTIZED_COST','NET_UNBLENDED_COST','NORMALIZED_USAGE_AMOUNT','UNBLENDED_COST']
        };

        const data = ce.getCostAndUsage(params, (err: Error| null, data :  AWS.CostExplorer.GetCostAndUsageResponse) => {
            if (err) {
                console.error(err, err.stack);
            } else {
                return data;
            }
        });
        // from promise exxtract and store the date in DB
        const res = await data.promise();
        //const res = debug_data;
        if(!res.ResultsByTime){
            throw new InternalServerErrorException('error while fetching data from aws service');
        }

        

        const metrics : Metric[] = []
        for(let i = 0; i < res.ResultsByTime.length; i++){
            let index = res.ResultsByTime.at(i);
            if(index?.TimePeriod){
                /*la seconde valeur dans la bdd est le service
                il y a souvent plusieurs on les traites donc comme des instances différentes
                */
               let curr_time_period = new Date(index.TimePeriod.Start);
                if(index?.Groups){
                    for(let i = 0; i < index?.Groups?.length; i++){
                        const metric: Metric = { timePeriod: new Date(), service: '', amortizedCost: 0, blendedCost: 0, netAmortizedCost: 0, unblendedCost: 0, netUnblendedCost: 0, usageQuantity: 0, normalizedUsageAmount: 0 };


                    
                        if (curr_time_period) {
                            metric.timePeriod = curr_time_period;
                        } 
                        
                        const curr_service = index.Groups.at(i)?.Keys?.at(0);
                        if (curr_service) {
                        metric.service = curr_service;
                        } 
            
                        const curr_amort_cost = index.Groups.at(i)?.Metrics?.AmortizedCost;
                        if (curr_amort_cost?.Amount) {
                        metric.amortizedCost = parseFloat(curr_amort_cost.Amount);
                        } 
                        const curr_blended_cost = index.Groups.at(i)?.Metrics?.BlendedCost;
                        if (curr_blended_cost?.Amount) {
                        metric.blendedCost = parseFloat(curr_blended_cost.Amount);
                        } 
            
                        const curr_net_amort_cost =
                        index.Groups.at(i)?.Metrics?.NetAmortizedCost;
                        if (curr_net_amort_cost?.Amount) {
                            metric.netAmortizedCost = parseFloat(curr_net_amort_cost.Amount);
                        }
                        
            
                        const curr_unblend_cost = index.Groups.at(i)?.Metrics?.UnblendedCost;
                        if (curr_unblend_cost?.Amount) {
                        metric.unblendedCost = parseFloat(curr_unblend_cost.Amount);
                        } 
                                
                        let curr_norm_usg_cost = index.Groups.at(i)?.Metrics?.NormalizedUsageAmount;
                        if(curr_norm_usg_cost?.Amount){
                            metric.normalizedUsageAmount =  parseInt(curr_norm_usg_cost.Amount);
                        }
                        
                        let curr_usg_qty = index.Groups.at(i)?.Metrics?.UsageQuantity;
                        if(curr_usg_qty?.Amount){
                            metric.usageQuantity = parseInt(curr_usg_qty.Amount);
                        }
                        

                        metrics.push(metric);
                    }
                }
            } 
        } 

        
         // add in the database
        for(let i = 0; i < metrics.length; i++){
            
            const metric = await this.prismaService.aws_metrics.create({
                data:{
                    timePeriod: metrics[i].timePeriod.toISOString(),
                    service: metrics[i].service,
                    amortizedCost: metrics[i].amortizedCost,
                    blendedCost: metrics[i].blendedCost,
                    netAmortizedCost: metrics[i].netAmortizedCost,
                    unblendedCost: metrics[i].unblendedCost,
                    netUnblendedCost: metrics[i].netUnblendedCost,
                    usageQuantity: metrics[i].usageQuantity,
                    normalizedUsageAmount: metrics[i].normalizedUsageAmount,
                }
            })

        }
        return metrics;
    }

    //Doit être seulement accèssible pour le role admin de projet
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

    
    //Doit seulement être accèssible pour les rôles admin de projet
    
    async getCredentials(){
        
        const res = await this.prismaService.aws_credentials.findMany();
        if(res){
            return res;
        }
    }

    // ajouter le CRUD

    async getMetrics(){
        const res = await this.prismaService.aws_metrics.findMany({
            select:{
                service:true,
                amortizedCost:true,
                timePeriod:true,
                blendedCost:true,
                netUnblendedCost:true,
                netAmortizedCost:true,
                //usageQuantity:true,
                normalizedUsageAmount:true,
            }
        });
        return res;
    }

    async getCostServices(){
        const res = await this.prismaService.aws_metrics.groupBy({
            by : ['service'],
            _sum : {
                blendedCost : true,
            }
            
        });
        
        let tmp : MetricGroupeBy[] = [];
        res.forEach((item)=>{
            let coutGroup : MetricGroupeBy = {cost : 0, service : undefined};
            let cout = item._sum.blendedCost;
            let service = item.service;
            if(cout && service){
                coutGroup.cost = cout;
                coutGroup.service = service;
                tmp.push(coutGroup);
            }
        });
        return tmp;
    }

    //je ne mets pas d'update car ça ne me parait pas inutile de modifier des métrics 

    async updateCredentials(credDto : CredentialDto){

        const cred = await this.prismaService.aws_credentials.findUnique({
            where:{
                accessKeyId : credDto.accessKeyId,
            }
        });

        if(!cred){
            throw new NotFoundException('this credential was not found');
        }


        return await this.prismaService.aws_credentials.update({
            where:{
                accessKeyId : credDto.accessKeyId
            },
            data:{
                accessKeyId : credDto.accessKeyId,
                secretAccessKey : credDto.secretAccessKey,
            }

        });
    }

    async removeCredential(credDto : RemoveCredentialDto){
        return await this.prismaService.aws_credentials.delete({
            where:{
                accessKeyId : credDto.accessKeyId,
            }
        });
    }

}