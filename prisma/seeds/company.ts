import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createCompanies = async (nbCompanies: number) => {
  console.log('Creating 10 companies');

  const users = await prisma.user.findMany();

  const companies = Array.from({ length: nbCompanies }, () => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    ownerId: users[Math.floor(Math.random() * users.length)].id,
  }));

  try {
    await prisma.$transaction(
      companies.map((project) => prisma.company.createMany({ data: project })),
    );
    console.log('Companies created successfully');
  } catch (error) {
    console.error('Error creating companies:', error);
  }
};

export const clearCompanies = async () => {
  console.log('Clearing companies');
  await prisma.company.deleteMany();
  console.log('Companies cleared');
};
