import { Injectable, Response } from "@nestjs/common";
//const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';
const credentials = {
    access_key : 'AKIA5FTZCBQ64VG6W5S2',
    secret_key : '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'
}


@Injectable({})
export class AwsService{


    constructor(){
        AWS.config.update({
            accessKeyId: credentials.access_key,
            secretAccessKey: credentials.secret_key,
            region: 'eu-west-3'
        })
    }


    getCost(){
        const ce = new AWS.CostExplorer();

        const params = {
            TimePeriod: {
                Start: '2024-01-01',
                End: '2024-01-31'
            },
            Granularity: 'DAILY',
            Metrics: ['BlendedCost','UsageQuantity']
        };

        const data = ce.getCostAndUsage(params, (err: Error| null, data :  AWS.CostExplorer.GetCostAndUsageResponse) => {
            if (err) {
                console.error(err, err.stack);
            } else {
                console.log(data);
                return data;
            }
           
            
        });
        return data;

    }

}