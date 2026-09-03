import { TransactionType } from '@prisma/client';

const CATEGORY_COLORS = [] as const;

export const EXPENSE_CATEGORY_NAMES = [] as const;

const LEGACY_CATEGORY_NAMES = [] as const;

export const DEFAULT_FINANCIAL_CATEGORIES = [
  { name: 'RECEITAS', type: TransactionType.INCOME, color: '#10B981' },
  ...EXPENSE_CATEGORY_NAMES.map((name, index) => ({
    name,
    type: TransactionType.EXPENSE,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })),
] as const;

type FinancialCategoryDelegate = {
  findUnique: (args: {
    where: {
      companyId_name_type: {
        companyId: string;
        name: string;
        type: TransactionType;
      };
    };
  }) => Promise<{ id: string } | null>;
  upsert: (args: {
    where: {
      companyId_name_type: {
        companyId: string;
        name: string;
        type: TransactionType;
      };
    };
    update: { color: string };
    create: {
      companyId: string;
      name: string;
      type: TransactionType;
      color: string;
    };
  }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

type FinancialTransactionDelegate = {
  count: (args: { where: { categoryId: string } }) => Promise<number>;
};

export async function syncFinancialCategories(
  prisma: {
    financialCategory: FinancialCategoryDelegate;
    financialTransaction: FinancialTransactionDelegate;
  },
  companyId: string,
): Promise<void> {
  for (const category of DEFAULT_FINANCIAL_CATEGORIES) {
    await prisma.financialCategory.upsert({
      where: {
        companyId_name_type: {
          companyId,
          name: category.name,
          type: category.type,
        },
      },
      update: { color: category.color },
      create: {
        companyId,
        name: category.name,
        type: category.type,
        color: category.color,
      },
    });
  }

  for (const legacyName of LEGACY_CATEGORY_NAMES) {
    for (const type of [TransactionType.INCOME, TransactionType.EXPENSE]) {
      const legacy = await prisma.financialCategory.findUnique({
        where: {
          companyId_name_type: {
            companyId,
            name: legacyName,
            type,
          },
        },
      });

      if (!legacy) continue;

      const transactionCount = await prisma.financialTransaction.count({
        where: { categoryId: legacy.id },
      });

      if (transactionCount === 0) {
        try {
          await prisma.financialCategory.delete({ where: { id: legacy.id } });
        } catch {
          // Category may still be referenced by soft-deleted transactions.
        }
      }
    }
  }
}

export async function seedDefaultFinancialCategories(
  prisma: {
    financialCategory: FinancialCategoryDelegate;
    financialTransaction: FinancialTransactionDelegate;
  },
  companyId: string,
): Promise<void> {
  await syncFinancialCategories(prisma, companyId);
}
