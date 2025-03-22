import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
    try {
        const { userId } = await auth();
        console.log("userrrrrr id ", userId);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
            headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        }).then((res) => {
            if (!res.ok) {
                throw new Error('Failed to fetch user data');
            }
            return res.json();
        });

        const { email_addresses, first_name, last_name, image_url } = user;

        let existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });

        if (!existingUser) {
            existingUser = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: email_addresses[0]?.email_address || '',
                    name: `${first_name || ''} ${last_name || ''}`.trim(),
                    picture: image_url || 'https://example.com/default-avatar.png',
                    role: "USER",
                },
            });
        }

        return NextResponse.json({ role: existingUser.role });
    } catch (error) {
        console.error("Error in POST function:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}