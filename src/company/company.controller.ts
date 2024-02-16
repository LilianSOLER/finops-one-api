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
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  AddMemberDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateMemberDto,
} from './dto';
import { CompanyEntity, CompanyMembersEntity } from './entities';
import { ProjectEntity } from '../project/entities';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyRolesGuard, JwtGuard, RolesGuard } from '../auth/guard';
import { CompanyRole, UserRole } from '@prisma/client';
import { CompanyRoles, Roles } from '../auth/decorator';

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
@UseGuards(JwtGuard, RolesGuard, CompanyRolesGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiOperation({ summary: 'Create company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created',
    type: CompanyEntity,
  })
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
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
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @ApiOperation({ summary: 'Get company projects' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company projects',
    type: [ProjectEntity],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get(':id/projects')
  getProjects(@Param('id') id: string) {
    return this.companyService.getProjects(id);
  }

  @ApiOperation({ summary: 'Get company members' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company members',
    type: [CompanyMembersEntity],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.companyService.getMembers(id);
  }

  @ApiOperation({ summary: 'Add company member' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Company member added',
  //   type: CompanyMembersEntity,
  // })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
    return this.companyService.addMember(id, addMemberDto);
  }

  @ApiOperation({ summary: 'Update company member' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Company member updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/members/:userId/role')
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.companyService.updateMember(id, userId, updateMemberDto);
  }
}
