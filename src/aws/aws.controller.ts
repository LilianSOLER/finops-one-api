import { Controller,Get, Res } from "@nestjs/common";
import { AwsService } from "./aws.service";

@Controller('aws')
export class AwsController{

    constructor(private awsService : AwsService){}

    @Get()
    getCost(){
        const result =  this.awsService.getCost();
        console.log(result);
        result
        .then(
            (result)=>{
                
                console.log(result.ResultsByTime); // object
                return result.ResultsByTime;
            }
        )
        .catch(
            (error) => {
                console.log(error);
            }
        )
        return result;
    }
}