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
import { CreateProjectDto, UpdateProjectDto } from './dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard, ProjectRolesGuard } from '../auth/guard';
import { ProjectRole, User } from '@prisma/client';
import { GetUser, Roles } from '../auth/decorator/';
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
@UseGuards(JwtGuard, ProjectRolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create project' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created',
    type: ProjectEntity,
  })
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
  @Roles(ProjectRole.ADMIN, ProjectRole.OWNER)
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
  @Roles(ProjectRole.ADMIN, ProjectRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
