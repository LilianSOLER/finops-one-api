import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { CompanyEntity } from './entities';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('companies')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad request',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiOperation({ summary: 'Create company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created',
    type: CompanyEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companies list',
    type: [CompanyEntity],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Companies not found',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @ApiOperation({ summary: 'Get company by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company found',
    type: CompanyEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @ApiOperation({ summary: 'Update company by id' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Company updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @ApiOperation({ summary: 'Delete company by id' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Company deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
