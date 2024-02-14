import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createProjects = async (nbProject: number) => {
  console.log('Creating 10 project');

  const users = await prisma.user.findMany();

  const companies = await prisma.company.findMany();

  const projects = Array.from({ length: nbProject }, () => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    ownerId: users[Math.floor(Math.random() * users.length)].id,
    companyId: companies[Math.floor(Math.random() * companies.length)].id,
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
