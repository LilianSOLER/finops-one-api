import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProjectMembers = async (nbMemberMaxPerProject: number) => {
  console.log('Adding members to projects');

  const users = await prisma.user.findMany();

  const allProjects = await prisma.project.findMany();

  const projectMembers = allProjects.map((project) => {
    const randomUsers = Array.from(
      { length: Math.floor(Math.random() * nbMemberMaxPerProject) },
      () => users[Math.floor(Math.random() * users.length)],
    );

    if (randomUsers.some((user) => user.id === project.ownerId)) {
      randomUsers.splice(
        randomUsers.findIndex((user) => user.id === project.ownerId),
        1,
      );
    }

    return randomUsers.map((user) => ({
      userId: user.id,
      projectId: project.id,
    }));
  });

  const owners = allProjects.map((project) => ({
    userId: project.ownerId,
    projectId: project.id,
    role: 'OWNER',
  }));

  projectMembers.push(owners);

  try {
    await prisma.$transaction(
      projectMembers.map((projectMember) =>
        prisma.projectMember.createMany({ data: projectMember }),
      ),
    );
  } catch (error) {
    console.error('Error adding members to projects:', error);
  }
};

export const clearProjectMembers = async () => {
  console.log('Clearing project members');
  await prisma.projectMember.deleteMany();
  console.log('Project members cleared');
};
