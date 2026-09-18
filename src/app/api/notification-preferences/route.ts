import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const preferenceSchema = z.object({
    types: z
        .array(
            z.object({
                type: z.string().min(1).max(40),
                enabled: z.boolean(),
            })
        )
        .max(50),
});

/** GET /api/notification-preferences — the caller's notification preferences. */
export async function GET() {
    try {
        const authed = await getAuthedUser();
        const prefs = await prisma.notification_preference.findMany({
            where: { userId: authed.user.id },
        });
        return ok({ preferences: prefs });
    } catch (e) {
        return toResponse(e, "[prefs.get]");
    }
}

/** PUT /api/notification-preferences — upsert the caller's preferences. */
export async function PUT(req: Request) {
    try {
        const authed = await getAuthedUser();
        let body: z.infer<typeof preferenceSchema>;
        try {
            body = preferenceSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }

        await prisma.$transaction(
            body.types.map((p) =>
                prisma.notification_preference.upsert({
                    where: { userId_type: { userId: authed.user.id, type: p.type } },
                    update: { enabled: p.enabled },
                    create: { userId: authed.user.id, type: p.type, enabled: p.enabled },
                })
            )
        );
        return ok({ updated: body.types.length });
    } catch (e) {
        return toResponse(e, "[prefs.put]");
    }
}
