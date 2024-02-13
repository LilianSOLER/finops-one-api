import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createProjects = async () => {
  console.log('Creating 10 project');

  const users = await prisma.user.findMany();

  const projects = Array.from({ length: 10 }, () => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    ownerId: users[Math.floor(Math.random() * users.length)].id,
  }));

  try {
    await prisma.$transaction(
      projects.map((project) => prisma.project.createMany({ data: project })),
    );
    console.log('Projects created successfully.');
  } catch (error) {
    console.error('Error creating projects:', error);
  }
};

export const clearProjects = async () => {
  console.log('Clearing projects');
  await prisma.project.deleteMany();
  console.log('Projects cleared');
};
