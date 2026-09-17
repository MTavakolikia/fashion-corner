import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

/** GET /api/admin/settings — platform settings */
export async function GET() {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const settings = await prisma.setting.findMany();
        return ok({ settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
    } catch (e) {
        return toResponse(e, "[admin.settings]");
    }
}

/** POST /api/admin/settings — update settings (batch). */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const body = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).parse(await req.json());

        await prisma.$transaction(
            Object.entries(body).map(([key, value]) =>
                prisma.setting.upsert({
                    where: { key },
                    update: { value: String(value), updatedAt: new Date() },
                    create: { key, value: String(value) },
                })
            )
        );
        auditLog(authed.user.id, AUDIT_ACTIONS.SETTINGS_CHANGED, "settings", undefined, { keys: Object.keys(body) });
        return ok({ updated: Object.keys(body) });
    } catch (e) {
        if (e instanceof z.ZodError) return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid settings payload.", 400, e.issues);
        return toResponse(e, "[admin.settings]");
    }
}
