import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const createCompanyMembers = async (nbMemberMaxPerCompany: number) => {
  console.log('Adding members to projects');

  const users = await prisma.user.findMany();

  const companies = await prisma.company.findMany();

  const companyMembers = companies.map((company) => {
    const randomUsers: User[] = Array.from(
      { length: Math.floor(Math.random() * nbMemberMaxPerCompany) },
      () => users[Math.floor(Math.random() * users.length)],
    );

    if (randomUsers.some((user) => user.id === company.ownerId)) {
      randomUsers.splice(
        randomUsers.findIndex((user) => user.id === company.ownerId),
        1,
      );
    }

    return randomUsers.map((user) => ({
      userId: user.id,
      companyId: company.id,
    }));
  });

  const owners = companies.map((company) => ({
    userId: company.ownerId,
    companyId: company.id,
    role: 'OWNER',
  }));

  companyMembers.push(owners);

  try {
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

export const clearCompanyMembers = async () => {
  console.log('Clearing company members');
  await prisma.companyMember.deleteMany();
  console.log('Company members cleared');
};
