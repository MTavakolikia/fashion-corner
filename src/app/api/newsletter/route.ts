import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.string().email().max(200) });

/** POST /api/newsletter — subscribe an email (public, idempotent, rate limited). */
export async function POST(req: Request) {
    try {
        rateLimit(req, "newsletter");
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "A valid email is required.", 400, (e as { issues?: unknown }).issues);
        }
        await prisma.newsletter_subscriber.upsert({
            where: { email: body.email.toLowerCase() },
            update: {},
            create: { email: body.email.toLowerCase() },
        });
        return ok({ subscribed: true });
    } catch (e) {
        return toResponse(e, "[newsletter.subscribe]");
    }
}
