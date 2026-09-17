import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
    fullName: z.string().min(2).max(120),
    address: z.string().min(5).max(250),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    zipCode: z.string().min(3).max(20),
    phone: z.string().min(7).max(20),
    isDefault: z.boolean().optional(),
});

const MAX_ADDRESSES = 10;

async function parseBody(req: Request) {
    const raw = await req.json().catch(() => ({}));
    return addressSchema.parse(raw);
}

function targetIdFrom(req: Request): string | null {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    return id && id.length > 0 ? id : null;
}

/** GET /api/addresses — the caller's saved addresses. */
export async function GET() {
    try {
        const authed = await getAuthedUser();
        const addresses = await prisma.address.findMany({
            where: { userId: authed.user.id },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        return ok({ addresses });
    } catch (e) {
        return toResponse(e, "[addresses.list]");
    }
}

/** POST /api/addresses — create an address (owner-only, capped). */
export async function POST(req: Request) {
    try {
        rateLimit(req, "address-mutation");
        const authed = await getAuthedUser();
        let body: z.infer<typeof addressSchema>;
        try {
            body = await parseBody(req);
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid address.", 400, (e as { issues?: unknown }).issues);
        }

        const count = await prisma.address.count({ where: { userId: authed.user.id } });
        if (count >= MAX_ADDRESSES) {
            return fail(ERROR_CODES.CONFLICT, `You can save at most ${MAX_ADDRESSES} addresses.`, 409);
        }

        const result = await prisma.$transaction(async (tx) => {
            if (body.isDefault) {
                await tx.address.updateMany({
                    where: { userId: authed.user.id },
                    data: { isDefault: false },
                });
            }
            return tx.address.create({
                data: {
                    id: `addr_${crypto.randomUUID()}`,
                    userId: authed.user.id,
                    fullName: body.fullName,
                    address: body.address,
                    city: body.city,
                    state: body.state,
                    zipCode: body.zipCode,
                    phone: body.phone,
                    isDefault: body.isDefault ?? false,
                    updatedAt: new Date(),
                },
            });
        });
        return ok(result, { status: 201 });
    } catch (e) {
        return toResponse(e, "[addresses.create]");
    }
}

/** PUT /api/addresses?id= — update one of the caller's addresses (IDOR-safe). */
export async function PUT(req: Request) {
    try {
        rateLimit(req, "address-mutation");
        const authed = await getAuthedUser();
        const targetId = targetIdFrom(req);
        if (!targetId) return fail(ERROR_CODES.VALIDATION_ERROR, "Address id is required (?id=).", 400);
        let body: z.infer<typeof addressSchema>;
        try {
            body = await parseBody(req);
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid address.", 400, (e as { issues?: unknown }).issues);
        }

        const existing = await prisma.address.findFirst({ where: { id: targetId, userId: authed.user.id } });
        if (!existing) return fail(ERROR_CODES.ADDRESS_NOT_FOUND, "Address not found.", 404);

        const result = await prisma.$transaction(async (tx) => {
            if (body.isDefault) {
                await tx.address.updateMany({
                    where: { userId: authed.user.id, id: { not: targetId } },
                    data: { isDefault: false },
                });
            }
            return tx.address.update({
                where: { id: targetId },
                data: {
                    fullName: body.fullName,
                    address: body.address,
                    city: body.city,
                    state: body.state,
                    zipCode: body.zipCode,
                    phone: body.phone,
                    isDefault: body.isDefault ?? existing.isDefault,
                },
            });
        });
        return ok(result);
    } catch (e) {
        return toResponse(e, "[addresses.update]");
    }
}

/** DELETE /api/addresses?id= — delete one of the caller's addresses (IDOR-safe). */
export async function DELETE(req: Request) {
    try {
        rateLimit(req, "address-mutation");
        const authed = await getAuthedUser();
        const targetId = targetIdFrom(req);
        if (!targetId) return fail(ERROR_CODES.VALIDATION_ERROR, "Address id is required (?id=).", 400);
        const existing = await prisma.address.findFirst({ where: { id: targetId, userId: authed.user.id } });
        if (!existing) return fail(ERROR_CODES.ADDRESS_NOT_FOUND, "Address not found.", 404);
        await prisma.address.delete({ where: { id: targetId } });
        return ok({ deleted: true });
    } catch (e) {
        return toResponse(e, "[addresses.delete]");
    }
}
