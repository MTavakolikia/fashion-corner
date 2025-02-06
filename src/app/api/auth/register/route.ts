import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then((res) => res.json());

    const { email_addresses, first_name, last_name, image_url } = user;

    const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!existingUser) {
        await prisma.user.create({
            data: {
                clerkId: userId,
                email: email_addresses[0]?.email_address || '',
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                picture: image_url || 'https://example.com/default-avatar.png',
            },
        });
    }

    return NextResponse.json({ message: "User saved" });
}
