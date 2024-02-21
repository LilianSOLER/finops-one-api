import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Function to create company members.
 * @param {number} nbMemberMaxPerCompany - Maximum number of members per company.
 */
export const createCompanyMembers = async (nbMemberMaxPerCompany: number) => {
  console.log('Adding members to projects');

  // Fetch all users from the database
  const users = await prisma.user.findMany();

  // Fetch all companies from the database
  const companies = await prisma.company.findMany();

  // Generate company members for each company
  const companyMembers = companies.map((company) => {
    // Generate random users from the list of all users
    const randomUsers: User[] = Array.from(
      { length: Math.floor(Math.random() * nbMemberMaxPerCompany) },
      () => users[Math.floor(Math.random() * users.length)],
    );

    // Remove the company owner from the list of random users
    if (randomUsers.some((user) => user.id === company.ownerId)) {
      randomUsers.splice(
        randomUsers.findIndex((user) => user.id === company.ownerId),
        1,
      );
    }

    // Map the random users to company members
    return randomUsers.map((user) => ({
      userId: user.id,
      companyId: company.id,
    }));
  });

  // Generate owner objects for each company
  const owners = companies.map((company) => ({
    userId: company.ownerId,
    companyId: company.id,
    role: 'OWNER',
  }));

  // Add owner objects to company members list
  companyMembers.push(owners);

  try {
    // Execute a transaction to create company members
    await prisma.$transaction(
      companyMembers.map((companyMember) =>
        prisma.companyMember.createMany({ data: companyMember }),
      ),
    );

    console.log('Members added to companies successfully');
  } catch (error) {
    console.error('Error adding members to companies:', error);
  }
};

/**
 * Function to clear all company members.
 */
export const clearCompanyMembers = async () => {
  console.log('Clearing company members');
  // Delete all company members from the database
  await prisma.companyMember.deleteMany();
  console.log('Company members cleared');
};
