import { Controller,Get, Body, Post } from "@nestjs/common";
import { AwsService } from "./aws.service";
import { CredentialDto } from "./dto/credential.dto";

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
    
    @Post('credentials')
    addCredentials(@Body() dto : CredentialDto){
        const result = this.awsService.addCredentials(dto);
    }
}