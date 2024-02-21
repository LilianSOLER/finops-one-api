import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Function to create companies.
 * @param {number} nbCompanies - Number of companies to create.
 */
export const createCompanies = async (nbCompanies: number) => {
  console.log('Creating 10 companies');

  // Fetch all users from the database
  const users = await prisma.user.findMany();

  // Generate an array of company objects using Faker.js
  const companies = Array.from({ length: nbCompanies }, () => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    ownerId: users[Math.floor(Math.random() * users.length)].id,
  }));

  try {
    // Execute a transaction to create companies
    await prisma.$transaction(
      companies.map((project) => prisma.company.createMany({ data: project })),
    );
    console.log('Companies created successfully');
  } catch (error) {
    console.error('Error creating companies:', error);
  }
};

/**
 * Function to clear all companies.
 */
export const clearCompanies = async () => {
  console.log('Clearing companies');
  // Delete all companies from the database
  await prisma.company.deleteMany();
  console.log('Companies cleared');
};
