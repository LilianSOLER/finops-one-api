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
import { ProjectService } from './project.service';
import {
  AddMemberDto,
  CreateProjectDto,
  UpdateMemberDto,
  UpdateProjectDto,
} from './dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyRolesGuard, JwtGuard, ProjectRolesGuard } from '../auth/guard';
import { ProjectRole, User } from '@prisma/client';
import { CompanyRoles, GetUser, ProjectRoles } from '../auth/decorator/';
import { ProjectEntity } from './entities';

@ApiTags('projects')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad request',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@ApiBearerAuth()
@UseGuards(JwtGuard, CompanyRolesGuard, ProjectRolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Create a new project.
   * @param createProjectDto - The data for creating a new project.
   * @param user - The authenticated user.
   * @returns The newly created project.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can create a project.
   */
  @ApiOperation({ summary: 'Create project' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created',
    type: ProjectEntity,
  })
  @CompanyRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @GetUser() user: User) {
    return this.projectService.create(createProjectDto, user);
  }

  /**
   * Get all projects.
   * @returns A list of all projects.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can get all projects.
   */
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projects list',
    type: [ProjectEntity],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projects not found',
  })
  @CompanyRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  /**
   * Get a project by ID.
   * @param id - The ID of the project.
   * @returns The project with the specified ID.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can get a project by ID.
   */
  @ApiOperation({ summary: 'Get project by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project',
    type: ProjectEntity,
  })
  @CompanyRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projects not found',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  /**
   * Update a project.
   * @param id
   * @param updateProjectDto
   * @returns The updated project.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can update a project.
   */
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated',
    type: ProjectEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projects not found',
  })
  @HttpCode(HttpStatus.OK)
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  /**
   * Delete a project by ID.
   * @param id - The ID of the project.
   * @returns The deleted project.
   * @roles Only users with the company role of 'ADMIN' or 'OWNER' can delete a project.
   */
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project deleted',
    type: ProjectEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projects not found',
  })
  @HttpCode(HttpStatus.OK)
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  /**
   * Get all user from project.
   * @param id
   * @returns List of users.
   * @roles Only users with the project role of 'ADMIN' or 'OWNER' can get all users from a project.
   */
  @ApiOperation({ summary: 'Get all user from project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users list',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users not found',
  })
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.projectService.getMembers(id);
  }

  /**
   * Add member to project.
   * @param id
   * @param addMemberDto
   * @returns Member added.
   * @roles Only users with the project role of 'ADMIN' or 'OWNER' can add a member to a project.
   */
  @ApiOperation({ summary: 'Add member to project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member added',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
    return this.projectService.addMember(id, addMemberDto);
  }

  /**
   * Update project member.
   * @param id
   * @param userId
   * @param updateMemberDto
   * @returns Project member updated.
   * @roles Only users with the project role of 'ADMIN' or 'OWNER' can update a project member.
   */
  @ApiOperation({ summary: 'Update project member' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project member updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/members/:userId/role')
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.projectService.updateMember(id, userId, updateMemberDto);
  }
}
