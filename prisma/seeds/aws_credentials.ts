import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Function to create aws credentials.
 * @param {number} n - Number of credentials to create.
 */
export const createcredentials = async (n: number) => {
  console.log('Creating ' + n + ' credentials');

  // Fetching all projects from the database
  const projects = await prisma.project.findMany();

  // Generate an array of company objects using Faker.js
  const cs = Array.from({ length: n }, () => {
    const project = projects[Math.floor(Math.random() * projects.length)];
    projects.splice(projects.indexOf(project), 1);
    return {
      createdAt: faker.date.recent(),
      accessKeyId: faker.string.alphanumeric(20),
      secretAccessKey: faker.string.alphanumeric(40),
      projectId: project.id,
    };
  });

  try {
    // Execute a transaction to create companies
    await prisma.$transaction(
      cs.map((c) => prisma.awsCredentials.createMany({ data: c })),
    );
    console.log('aws credentials created successfully');
  } catch (error) {
    console.error('Error creating aws credentials:', error);
  }
};

/**
 * Function to clear all aws credentials.
 */
export const clearawscredentials = async () => {
  console.log('Clearing aws credentials');
  // Delete all aws credentials from the database
  await prisma.awsCredentials.deleteMany();
  console.log('aws credentials cleared');
};
