import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type * as PrismaType from "@prisma/client"

// Lazy singleton — creates PrismaClient on first use
let _prisma: PrismaClient | undefined

function createClient() {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL ?? "",
    });
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}

export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (!_prisma) {
            _prisma = createClient();
        }
        return (_prisma as any)[prop];
    },
    set(_target, prop, value) {
        if (!_prisma) {
            _prisma = createClient();
        }
        (_prisma as any)[prop] = value;
        return true;
    },
}) as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
    (globalThis as any).prisma = _prisma;
}

export type { PrismaType }
