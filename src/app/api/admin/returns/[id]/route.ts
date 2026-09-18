import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";
import { ERROR_CODES } from "@/lib/error-codes";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/returns/[id] — transition return request status. */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const body = z.object({ to: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "RECEIVED", "REFUND_PENDING", "REFUNDED"]) }).parse(await req.json());
        const { processReturn } = await import("@/lib/services/returns");
        await processReturn({ returnId: id, to: body.to, actorId: authed.user.id });
        return ok({ updated: true });
    } catch (e) {
        return toResponse(e, "[admin.returns.patch]");
    }
}
