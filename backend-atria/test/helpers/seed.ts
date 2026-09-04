import * as bcrypt from 'bcrypt';
import { PrismaClient, RoleName, UserCategory } from '@prisma/client';
import {
  E2E_RUN_ID,
  TEST_ADMIN,
  TEST_CLIENT_USER,
  TEST_COMPANY_NAME,
} from './constants';

type PrismaLike = Pick<
  PrismaClient,
  | 'user'
  | 'client'
  | 'role'
  | 'financialCategory'
  | 'kanbanColumn'
  | 'contentPost'
  | 'kanbanTask'
  | 'financialTransaction'
  | 'calendarEvent'
  | 'proposal'
>;

export async function cleanupE2EData(prisma: PrismaLike, runId: string) {
  await prisma.contentPost.deleteMany({
    where: { title: { contains: runId } },
  });
  await prisma.kanbanTask.deleteMany({
    where: { title: { contains: runId } },
  });
  await prisma.calendarEvent.deleteMany({
    where: { title: { contains: runId } },
  });
  await prisma.proposal.deleteMany({
    where: { title: { contains: runId } },
  });
  await prisma.financialTransaction.deleteMany({
    where: { description: { contains: runId } },
  });
  await prisma.client.deleteMany({
    where: {
      companyName: { contains: runId },
    },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [TEST_ADMIN.email, TEST_CLIENT_USER.email] } },
  });
}

export async function seedE2EData(prisma: PrismaLike) {
  await cleanupE2EData(prisma, E2E_RUN_ID);

  const passwordHash = await bcrypt.hash(TEST_ADMIN.password, 12);
  const clientPasswordHash = await bcrypt.hash(TEST_CLIENT_USER.password, 12);

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.ADMIN },
  });
  const clientRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.CLIENT },
  });

  const client = await prisma.client.create({
    data: { companyName: TEST_COMPANY_NAME },
  });

  const otherClient = await prisma.client.create({
    data: { companyName: `Other ${TEST_COMPANY_NAME}` },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: TEST_ADMIN.name,
      email: TEST_ADMIN.email,
      passwordHash,
      roleId: adminRole.id,
      category: UserCategory.MEMBER,
      mustChangePassword: false,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: TEST_CLIENT_USER.name,
      email: TEST_CLIENT_USER.email,
      passwordHash: clientPasswordHash,
      roleId: clientRole.id,
      category: UserCategory.CLIENT,
      clientId: client.id,
      mustChangePassword: false,
    },
  });

  const incomeCategory = await prisma.financialCategory.findFirst({
    where: { type: 'INCOME' },
    orderBy: { name: 'asc' },
  });
  const expenseCategory = await prisma.financialCategory.findFirst({
    where: { type: 'EXPENSE' },
    orderBy: { name: 'asc' },
  });

  if (!incomeCategory || !expenseCategory) {
    throw new Error('Financial categories missing — run prisma seed');
  }

  const columns = await prisma.kanbanColumn.findMany({
    orderBy: { order: 'asc' },
    take: 3,
  });

  if (columns.length < 2) {
    throw new Error('Kanban columns missing — run prisma seed');
  }

  return {
    adminUserId: adminUser.id,
    clientUserId: clientUser.id,
    clientId: client.id,
    otherClientId: otherClient.id,
    categoryIds: { income: incomeCategory.id, expense: expenseCategory.id },
    kanbanColumnIds: columns.map((column) => column.id),
  };
}
