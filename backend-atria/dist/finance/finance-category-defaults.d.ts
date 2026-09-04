import { TransactionType } from '@prisma/client';
export declare const EXPENSE_CATEGORY_NAMES: readonly [];
export declare const DEFAULT_FINANCIAL_CATEGORIES: readonly [{
    readonly name: "RECEITAS";
    readonly type: "INCOME";
    readonly color: "#10B981";
}, ...{
    name: never;
    type: "EXPENSE";
    color: never;
}[]];
type FinancialCategoryDelegate = {
    findUnique: (args: {
        where: {
            companyId_name_type: {
                companyId: string;
                name: string;
                type: TransactionType;
            };
        };
    }) => Promise<{
        id: string;
    } | null>;
    upsert: (args: {
        where: {
            companyId_name_type: {
                companyId: string;
                name: string;
                type: TransactionType;
            };
        };
        update: {
            color: string;
        };
        create: {
            companyId: string;
            name: string;
            type: TransactionType;
            color: string;
        };
    }) => Promise<unknown>;
    delete: (args: {
        where: {
            id: string;
        };
    }) => Promise<unknown>;
};
type FinancialTransactionDelegate = {
    count: (args: {
        where: {
            categoryId: string;
        };
    }) => Promise<number>;
};
export declare function syncFinancialCategories(prisma: {
    financialCategory: FinancialCategoryDelegate;
    financialTransaction: FinancialTransactionDelegate;
}, companyId: string): Promise<void>;
export declare function seedDefaultFinancialCategories(prisma: {
    financialCategory: FinancialCategoryDelegate;
    financialTransaction: FinancialTransactionDelegate;
}, companyId: string): Promise<void>;
export {};
