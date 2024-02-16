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
