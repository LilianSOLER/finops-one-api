import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

const prisma = new PrismaClient();

/**
 * Function to create users.
 * @param {number} nbUser - Number of users to create.
 */
export const createUsers = async (nbUser: number) => {
  // Hash the password using Argon2
  const password = await argon.hash('password');

  // Generate an array of user objects using Faker.js
  const users = Array.from({ length: nbUser }, () => ({
    email: faker.internet.email(),
    hashedPassword: password,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }));

  try {
    // Execute a transaction to create users
    await prisma.$transaction(
      users.map((user) => prisma.user.createMany({ data: user })),
    );
    console.log('Users created successfully.');
  } catch (error) {
    console.error('Error creating users:', error);
  }
};

/**
 * Function to clear all users.
 */
export const clearUsers = async () => {
  console.log('Clearing users');
  // Delete all users from the database
  await prisma.user.deleteMany();
  console.log('Users cleared');
};
