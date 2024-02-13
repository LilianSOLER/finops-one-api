import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createUsers = async () => {
  const users = Array.from({ length: 10 }, () => ({
    email: faker.internet.email(),
    hashedPassword: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }));

  try {
    await prisma.$transaction(
      users.map((user) => prisma.user.createMany({ data: user })),
    );
    console.log('Users created successfully.');
  } catch (error) {
    console.error('Error creating users:', error);
  }
};

export const clearUsers = async () => {
  console.log('Clearing users');
  await prisma.user.deleteMany();
  console.log('Users cleared');
};
