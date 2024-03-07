import {
  clearCompanies,
  clearCompanyMembers,
  clearProjectMembers,
  clearProjects,
  clearUsers,
  createCompanies,
  createCompanyMembers,
  createProjectMembers,
  createProjects,
  createUsers,
} from './seeds';
import { PrismaClient } from '@prisma/client';
import {
  clearawscredentials,
  createcredentials,
} from './seeds/aws_credentials';
import { clearawsmetric, createmetric } from './seeds/aws_metric';

const prisma = new PrismaClient();

async function main() {
  await clearawscredentials();
  await clearawsmetric();
  await clearProjectMembers();
  await clearCompanyMembers();
  await clearProjects();
  await clearCompanies();
  await clearUsers();
  await createUsers(1000);
  await createCompanies(10);
  await createCompanyMembers(200);
  await createProjects(50);
  await createProjectMembers(50);
  await createcredentials(50);
  await createmetric(1000);
}

main()
  .then(async () => {
    // Disconnect Prisma client after successful execution
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
