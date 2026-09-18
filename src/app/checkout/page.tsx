import { getAuthedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutFlow from "./CheckoutFlow";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
    const authed = await getAuthedUser();
    if (!authed) redirect("/sign-in");

    const params = await searchParams;
    const step = params.step ?? "cart";

    const addresses = await prisma.address.findMany({
        where: { userId: authed.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    const defaultAddressId = addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id;

    return (
        <CheckoutFlow
            initialStep={step}
            savedAddresses={addresses}
            defaultAddressId={defaultAddressId}
            userId={authed.user.id}
            userEmail={authed.user.email}
            userName={authed.user.name ?? undefined}
        />
    );
}
