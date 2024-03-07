import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Function to create aws credentials.
 * @param {number} n - Number of credentials to create.
 */
export const createmetric = async (n: number) => {
  console.log('Creating ' + n + ' credentials');
  /*
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
                                            */
  const projects = await prisma.project.findMany();

  const ms = Array.from({ length: n }, () => {
    const r = {
      timePeriod: faker.date.recent(),
      service: faker.word.sample(),
      amortizedCost: faker.number.int({ min: 0, max: 1000 }),
      blendedCost: faker.number.int({ min: 0, max: 1000 }),
      unblendedCost: faker.number.int({ min: 0, max: 1000 }),
      netUnblendedCost: faker.number.int({ min: 0, max: 1000 }),
      netAmortizedCost: faker.number.int({ min: 0, max: 1000 }),
      normalizedUsageAmount: faker.number.int({ min: 0, max: 1000 }),
      usageQuantity: faker.number.int({ min: 0, max: 1000 }),
    };

    const s = Math.random() < faker.number.float({ min: 0, max: 1 });
    if (s) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete r[
        Object.keys(r)[Math.floor(Math.random() * Object.keys(r).length)]
      ];
    }

    const r2 = {
      ...r,
      projectId: projects[Math.floor(Math.random() * projects.length)].id,
    };

    return r2;
  });

  try {
    // Execute a transaction to create companies
    await prisma.$transaction(
      ms.map((m) => prisma.awsMetrics.create({ data: m })),
    );
    console.log('aws credentials created successfully');
  } catch (error) {
    console.error('Error creating aws credentials:', error);
  }
};

/**
 * Function to clear all aws credentials.
 */
export const clearawsmetric = async () => {
  console.log('Clearing aws credentials');
  // Delete all aws credentials from the database
  await prisma.awsMetrics.deleteMany();
  console.log('aws credentials cleared');
};
