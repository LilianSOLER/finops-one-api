import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import {HerokuModule} from './heroku/heroku.module';
import {PrismaModule} from './prisma/prisma.module';
import {AwsModule} from './aws/aws.module';
import {ScheduleModule} from '@nestjs/schedule';
import {UserModule} from './user/user.module';
import {ProjectModule} from './project/project.module';
import {CompanyModule} from './company/company.module';
import {HttpModule} from '@nestjs/axios';
import {AzureModule} from './azure/azure.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        HerokuModule,
        PrismaModule,
        HttpModule,
        AuthModule,
        PrismaModule,
        AzureModule,
        AwsModule,
        UserModule,
        ProjectModule,
        CompanyModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
