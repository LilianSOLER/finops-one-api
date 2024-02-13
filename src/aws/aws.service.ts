import { ForbiddenException, Injectable, InternalServerErrorException, Response } from "@nestjs/common";
//const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';
import { CredentialDto } from "./dto/credential.dto";
import {PrismaService} from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const credentials = {
    access_key : 'AKIA5FTZCBQ64VG6W5S2',
    secret_key : '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'
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

        //retrieve and update aws credentials and set it
        AWS.config.update({
            accessKeyId: credentials.access_key,
            secretAccessKey: credentials.secret_key,
            region: 'eu-west-3'
        })

        //set the query (date)

        const params = {
            TimePeriod: {
                Start: '2024-02-01',
                End: '2024-02-08'
            },

            Granularity: 'DAILY',
            GroupBy : [{"Type" : "DIMENSION", "Key" :"SERVICE"}],
            Metrics: ['BLENDED_COST','USAGE_QUANTITY','AMORTIZED_COST','NET_AMORTIZED_COST','NET_UNBLENDED_COST','NORMALIZED_USAGE_AMOUNT','UNBLENDED_COST']
        };

        // const data = ce.getCostAndUsage(params, (err: Error| null, data :  AWS.CostExplorer.GetCostAndUsageResponse) => {
        //     if (err) {
        //         console.error(err, err.stack);
        //     } else {
        //         //console.log(data);
        //         return data;
        //     }
        // });
        // from promise exxtract and store the date in DB
        //const res = await data.promise();
        const res = debug_data;
        if(!res.ResultsByTime){
            throw new InternalServerErrorException('error while fetching data from aws service');
        }

        // créer tableau avec les colonnes remplit puis faire un create many
        const metrics = [];
        for(let i = 0; i < res.ResultsByTime.length; i++){

            let index = res.ResultsByTime.at(i);
            if(index?.TimePeriod){
                /*la seconde valeur dans la bdd est le service
                il y a souvent plusieurs on les traites donc comme des instances différentes
                */
               let curr_time_period = new Date(index.TimePeriod.Start);
                if(index?.Groups){
                    for(let i = 0; i < index?.Groups?.length; i++){
                        let metric = []
                        
                        if(curr_time_period){metric.push(curr_time_period); }else{metric.push("0");}

                        let curr_service = index.Groups.at(i)?.Keys?.at(0);
                        if(curr_service){metric.push(curr_service);}else{metric.push("1");}

                        let curr_amort_cost = index.Groups.at(i)?.Metrics?.AmortizedCost;
                        if(curr_amort_cost?.Amount){metric.push(parseFloat(curr_amort_cost.Amount));}else{metric.push(1);}

                        let curr_blend_cost = index.Groups.at(i)?.Metrics?.BlendedCost;
                        if(curr_blend_cost?.Amount){metric.push(parseFloat(curr_blend_cost.Amount));}else{metric.push(1);}

                        let curr_net_amort_cost = index.Groups.at(i)?.Metrics?.NetAmortizedCost;
                        if(curr_net_amort_cost?.Amount){metric.push(parseFloat(curr_net_amort_cost.Amount));}else{metric.push(1);}

                        let curr_unblend_cost = index.Groups.at(i)?.Metrics?.UnblendedCost;
                        if(curr_unblend_cost?.Amount){metric.push(parseFloat(curr_unblend_cost.Amount));}else{metric.push(1);}

                        let curr_net_unblend_cost = index.Groups.at(i)?.Metrics?.NetUnblendedCost;
                        if(curr_net_unblend_cost?.Amount){metric.push(parseFloat(curr_net_unblend_cost.Amount));}else{metric.push(1);}

                        let curr_usg_qte = index.Groups.at(i)?.Metrics?.UsageQuantity;
                        if(curr_usg_qte?.Amount){metric.push(parseInt(curr_usg_qte.Amount));}else{metric.push(1);}
                        
                        let curr_norm_usg_cost = index.Groups.at(i)?.Metrics?.NormalizedUsageAmount;
                        if(curr_norm_usg_cost?.Amount){metric.push(parseInt(curr_norm_usg_cost.Amount));}else{metric.push(1);}

                        metrics.push(metric);
                    }
                }
            } 
        }

        const vars = ["timePeriod", "service", "amortizedCost", "blendedCost", "netAmortizedCost","unblendedCost","netUnblendedCost", "usageQuantity","normalizedUsageAmount"]

        for(const metric of metrics){
            for(let i = 0; i < metric.length; i++){
                console.log(vars[i] , " vaut " , metric[i], "est du type : ", typeof metric[i])
            }
        }
        // console.log(metrics[0][1]);
    
        
         // add in the database
        for(let i = 0; i < metrics.length; i++){
            this.prismaService.aws_metrics.create({
                data:{
                    timePeriod : metrics[i][0],
                    service : "string'",
                    amortizedCost : 1,
                    blendedCost : 1,
                    netAmortizedCost : 1,
                    unblendedCost : 1,
                    netUnblendedCost : 1,
                    usageQuantity : 1,
                    normalizedUsageAmount : 1
                }
            })
        }
        return res;


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