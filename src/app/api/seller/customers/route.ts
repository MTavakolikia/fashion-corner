import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { sellerCustomers } from "@/lib/services/products";
import type { RangeKey } from "@/lib/services/products";

export const dynamic = "force-dynamic";

/** GET /api/seller/customers?range=30d — distinct buyers of the seller's products. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const url = new URL(req.url);
        const range = (url.searchParams.get("range") ?? "30d") as RangeKey;
        const customers = await sellerCustomers(authed.user.id, range);
        return ok({ customers });
    } catch (e) {
        return toResponse(e, "[seller.customers]");
    }
}
