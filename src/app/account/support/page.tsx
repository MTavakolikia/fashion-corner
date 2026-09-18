import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const CATEGORIES = ["ORDER", "PRODUCT", "SHIPPING", "RETURN", "BILLING", "OTHER"];

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
    const { userId } = await auth();
    if (!userId) return null;
    const params = await searchParams;
    const isNew = (await params).new === "1";

    const tickets = await prisma.support_ticket.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return (
        <AccountShell title="Support">
            <div className="flex items-center justify-end mb-4">
                <Link href="/account/support?new=1" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    New Ticket
                </Link>
            </div>

            {isNew ? (
                <NewTicketForm categories={CATEGORIES} />
            ) : (
                <>
                    {tickets.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((t) => (
                                <TicketRow key={t.id} ticket={t} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </AccountShell>
    );
}

function TicketRow({ ticket }: { ticket: any }) {
    const statusStyles: Record<string, string> = {
        OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        #{ticket.id.slice(-6)} آ· {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{ticket.message}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles[ticket.status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                    {ticket.status.replace("_", " ").toLowerCase()}
                </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{ticket.category}</span>
                {ticket.priority === "HIGH" || ticket.priority === "URGENT" && (
                    <span className="text-xs text-red-600 font-medium">{ticket.priority} Priority</span>
                )}
                {ticket.resolvedAt && <span className="text-xs text-muted-foreground">Resolved {new Date(ticket.resolvedAt).toLocaleDateString()}</span>}
            </div>
        </div>
    );
}

function NewTicketForm({ categories }: { categories: string[] }) {
    return (
        <form action={async (fd) => {
            "use server";
            const subject = fd.get("subject") as string;
            const message = fd.get("message") as string;
            const category = fd.get("category") as string;
            await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message, category }),
            });
        }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">New Support Ticket</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input name="subject" required maxLength={200} placeholder="Brief description of your issue" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select name="category" required className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                    {categories.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Describe your issue in detail..." className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-y" />
            </div>
            <div className="flex gap-3">
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Submit Ticket</button>
                <Link href="/account/support" className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</Link>
            </div>
        </form>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-3">No support tickets yet</p>
            <Link href="/account/support?new=1" className="text-primary hover:underline text-sm">Create a ticket</Link>
        </div>
    );
}
