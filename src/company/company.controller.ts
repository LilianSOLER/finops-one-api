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

/**
 * Controller for handling company-related operations.
 */
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

  /**
   * Create a new company.
   * @param createCompanyDto Data for creating a company.
   * @returns The newly created company.
   * @roles Only users with the role of 'ADMIN' can create a company.
   */
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

  /**
   * Get all companies.
   * @returns List of companies.
   * @roles Only users with the role of 'ADMIN' can view all companies.
   */
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

  /**
   * Get a company by ID.
   * @param id The ID of the company.
   * @returns The company.
   * @roles Only users with the role of 'ADMIN' can view company details.
   */
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

  /**
   * Update a company by ID.
   * @param id The ID of the company.
   * @param updateCompanyDto Data for updating the company.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can update a company.
   */
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

  /**
   * Delete a company by ID.
   * @param id
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can delete a company.
   * @returns No content.
   */
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

  /**
   * Get company projects.
   * @param id
   * @returns List of projects.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can view company projects.
   */
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

  /**
   * Get all members of a company.
   * @param id The ID of the company.
   * @returns List of company members.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can view company members.
   */
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

  /**
   * Add a member to a company.
   * @param id The ID of the company.
   * @param addMemberDto Data for adding a member to the company.
   * @returns The newly added company member.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can add a member to a company.
   */

  @ApiOperation({ summary: 'Add company member' })
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

  /**
   * Update a member from a company.
   * @param id The ID of the company.
   * @param userId The ID of the user to update from the company.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can update a member from a company.
   * @returns No content.
   */
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
