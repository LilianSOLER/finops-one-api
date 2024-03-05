import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Function to create project members.
 * @param {number} nbMemberMaxPerProject - Maximum number of members per project.
 */
export const createProjectMembers = async (nbMemberMaxPerProject: number) => {
  console.log('Adding members to projects');

  // Fetch all users from the database
  const users = await prisma.user.findMany();

  // Fetch all projects from the database
  const allProjects = await prisma.project.findMany();

  // Generate project members for each project
  const projectMembers = allProjects.map((project) => {
    // Generate random users from the list of all users
    const randomUsers = Array.from(
      { length: Math.floor(Math.random() * nbMemberMaxPerProject) },
      () => users[Math.floor(Math.random() * users.length)],
    );

    // Remove the project owner from the list of random users if present
    if (randomUsers.some((user) => user.id === project.ownerId)) {
      randomUsers.splice(
        randomUsers.findIndex((user) => user.id === project.ownerId),
        1,
      );
    }

    // Map the random users to project members
    return randomUsers.map((user) => ({
      userId: user.id,
      projectId: project.id,
    }));
  });

  // Generate owner objects for each project
  const owners = allProjects.map((project) => ({
    userId: project.ownerId,
    projectId: project.id,
    role: 'OWNER',
  }));

  // Add owner objects to project members list
  projectMembers.push(owners);

  try {
    // Execute a transaction to create project members
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
  // Delete all project members from the database
  await prisma.projectMember.deleteMany();
  console.log('Project members cleared');
};
