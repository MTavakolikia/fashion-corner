import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type * as PrismaType from "@prisma/client"

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

// In development / serverless, wrap the prisma instance so it is recreated
// per request rather than shared across requests (Turbopack + Vercel compat).
export const prisma =
    process.env.NODE_ENV === 'production' || typeof global !== 'undefined'
        ? (globalThis as any).__prisma ?? (() => {
              const c = createClient();
              (globalThis as any).__prisma = c;
              return c;
          })()
        : createClient();

if (process.env.NODE_ENV !== 'production') {
    (globalThis as any).__prisma = _prisma;
}

export type { PrismaType }
