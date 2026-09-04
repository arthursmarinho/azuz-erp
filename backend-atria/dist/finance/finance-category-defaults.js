"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FINANCIAL_CATEGORIES = exports.EXPENSE_CATEGORY_NAMES = void 0;
exports.syncFinancialCategories = syncFinancialCategories;
exports.seedDefaultFinancialCategories = seedDefaultFinancialCategories;
const client_1 = require("@prisma/client");
const CATEGORY_COLORS = [];
exports.EXPENSE_CATEGORY_NAMES = [];
const LEGACY_CATEGORY_NAMES = [];
exports.DEFAULT_FINANCIAL_CATEGORIES = [
    { name: 'RECEITAS', type: client_1.TransactionType.INCOME, color: '#10B981' },
    ...exports.EXPENSE_CATEGORY_NAMES.map((name, index) => ({
        name,
        type: client_1.TransactionType.EXPENSE,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })),
];
async function syncFinancialCategories(prisma, companyId) {
    for (const category of exports.DEFAULT_FINANCIAL_CATEGORIES) {
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
        for (const type of [client_1.TransactionType.INCOME, client_1.TransactionType.EXPENSE]) {
            const legacy = await prisma.financialCategory.findUnique({
                where: {
                    companyId_name_type: {
                        companyId,
                        name: legacyName,
                        type,
                    },
                },
            });
            if (!legacy)
                continue;
            const transactionCount = await prisma.financialTransaction.count({
                where: { categoryId: legacy.id },
            });
            if (transactionCount === 0) {
                try {
                    await prisma.financialCategory.delete({ where: { id: legacy.id } });
                }
                catch {
                }
            }
        }
    }
}
async function seedDefaultFinancialCategories(prisma, companyId) {
    await syncFinancialCategories(prisma, companyId);
}
//# sourceMappingURL=finance-category-defaults.js.map