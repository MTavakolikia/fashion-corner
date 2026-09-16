/**
 * Transactional email abstraction.
 *
 * Production wiring (future): implement EmailProvider for Resend/SES/Postmark
 * behind EMAIL_PROVIDER=resend|ses|postmark with the provider's API key from env.
 * Today the DevEmailProvider logs emails to the server console so the whole
 * order lifecycle works end-to-end without an external dependency.
 */

export interface EmailMessage {
    to: string;
    subject: string;
    /** Plain-text body (templates render text; providers may map to HTML). */
    text: string;
    tags?: string[];
}

export interface EmailProvider {
    readonly name: string;
    send(message: EmailMessage): Promise<void>;
}

class DevEmailProvider implements EmailProvider {
    readonly name = "dev";
    async send(message: EmailMessage): Promise<void> {
        console.log(
            `[email:dev] to=${message.to} subject="${message.subject}" tags=${message.tags?.join(",") ?? ""}`
        );
        console.log(message.text);
    }
}

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
    if (!provider) {
        // Single strategy today; swap via env without touching call sites.
        provider = new DevEmailProvider();
    }
    return provider;
}

/** Send without blocking the caller (fire-and-forget with logging). */
export function sendEmail(message: EmailMessage): void {
    getEmailProvider()
        .send(message)
        .catch((err) => console.error("[email] send failed", err));
}

// ─── Transactional templates ─────────────────────────────────────────────

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const emailTemplates = {
    orderConfirmation(orderId: string, email: string, total: number, items: number) {
        return sendEmail({
            to: email,
            subject: `Order ${orderId.slice(-8)} confirmed — Fashion Corner`,
            tags: ["order", "confirmation"],
            text: `Hi,\n\nYour order #${orderId.slice(-8)} (${items} item${items === 1 ? "" : "s"}, $${total.toFixed(2)}) has been placed and is pending processing.\n\nTrack it any time:\n${SITE}/account/orders/${orderId}\n\n— Fashion Corner`,
        });
    },
    orderShipped(orderId: string, email: string, tracking: string | null) {
        return sendEmail({
            to: email,
            subject: `Your order is on the way${tracking ? ` (${tracking})` : ""}`,
            tags: ["order", "shipping"],
            text: `Hi,\n\nGood news — your order #${orderId.slice(-8)} has been shipped.\n${tracking ? `Tracking number: ${tracking}\n` : ""}\n${SITE}/account/orders/${orderId}\n\n— Fashion Corner`,
        });
    },
    orderDelivered(orderId: string, email: string) {
        return sendEmail({
            to: email,
            subject: `Your order has been delivered`,
            tags: ["order", "delivery"],
            text: `Hi,\n\nYour order #${orderId.slice(-8)} was delivered. If everything looks good, we'd love a review.\n\n— Fashion Corner`,
        });
    },
    orderCancelled(orderId: string, email: string, reason?: string) {
        return sendEmail({
            to: email,
            subject: `Your order has been cancelled`,
            tags: ["order", "cancellation"],
            text: `Hi,\n\nYour order #${orderId.slice(-8)} was cancelled.${reason ? ` Reason: ${reason}` : ""}\nAny pending payment will be voided or refunded automatically.\n\n— Fashion Corner`,
        });
    },
    refundConfirmed(orderId: string, email: string, amount: number) {
        return sendEmail({
            to: email,
            subject: `Refund of $${amount.toFixed(2)} confirmed`,
            tags: ["refund"],
            text: `Hi,\n\nA refund of $${amount.toFixed(2)} for order #${orderId.slice(-8)} has been processed. It may take a few business days to reach your account.\n\n— Fashion Corner`,
        });
    },
    welcome(name: string, email: string) {
        return sendEmail({
            to: email,
            subject: "Welcome to Fashion Corner",
            tags: ["welcome"],
            text: `Hi ${name},\n\nWelcome to Fashion Corner. Browse the new arrivals, build your wishlist, and enjoy free shipping on qualifying orders.\n\n${SITE}\n\n— The Fashion Corner team`,
        });
    },
};
