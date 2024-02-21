import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Function to create projects.
 * @param {number} nbProject - Number of projects to create.
 */
export const createProjects = async (nbProject: number) => {
  console.log('Creating 10 project');

  // Fetch all users from the database
  const users = await prisma.user.findMany();

  // Fetch all companies from the database
  const companies = await prisma.company.findMany();

  // Generate an array of project objects using Faker.js
  const projects = Array.from({ length: nbProject }, () => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    ownerId: users[Math.floor(Math.random() * users.length)].id,
    companyId: companies[Math.floor(Math.random() * companies.length)].id,
  }));

  try {
    // Execute a transaction to create projects
    await prisma.$transaction(
      projects.map((project) => prisma.project.createMany({ data: project })),
    );
    console.log('Projects created successfully.');
  } catch (error) {
    console.error('Error creating projects:', error);
  }
};

/**
 * Function to clear all projects.
 */
export const clearProjects = async () => {
  console.log('Clearing projects');
  // Delete all projects from the database
  await prisma.project.deleteMany();
  console.log('Projects cleared');
};
