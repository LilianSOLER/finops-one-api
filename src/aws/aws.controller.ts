import { Controller,Get, Res } from "@nestjs/common";
import { AwsService } from "./aws.service";

@Controller('aws')
export class AwsController{

    constructor(private awsService : AwsService){}

    @Get()
    getCost(@Res() res : Response){
        return this.awsService.getCost();
    }
}