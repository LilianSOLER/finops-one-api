import {
  clearProjectMembers,
  clearProjects,
  clearUsers,
  createProjectMembers,
  createProjects,
  createUsers,
} from './seeds';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await clearProjectMembers();
  await clearProjects();
  await clearUsers();
  await createUsers();
  await createProjects();
  await createProjectMembers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
