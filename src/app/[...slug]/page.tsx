import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";

export async function generateMetadata(
    { params, searchParams }: { params: Promise<{ slug: string | string[] }>; searchParams: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const h = await headers();
    const host = h.get("host") ?? "";
    const url = `https://${host}`;
    const prev = await parent;
    const rawSlug = (await searchParams).slug ?? ((await params).slug ?? "");
    const slug = Array.isArray(rawSlug) ? (rawSlug[0] ?? "") : (typeof rawSlug === "string" ? rawSlug : "");
    const title = slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)} — Fashion Corner` : "Fashion Corner";

    return {
        title,
        description: prev.openGraph?.description as string | undefined || `Browse ${title} at Fashion Corner`,
        alternates: { canonical: `${url}/${slug}` },
        openGraph: { url: `${url}/${slug}`, title },
        twitter: { card: "summary_large_image", title },
    };
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string | string[] }>; searchParams: Promise<Record<string, string>> }) {
    const rawSlug = (await searchParams).slug ?? ((await params).slug ?? "");
    const slug = Array.isArray(rawSlug) ? (rawSlug[0] ?? "") : (typeof rawSlug === "string" ? rawSlug : "");
    const titles: Record<string, string> = {
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        shipping: "Shipping Policy",
        returns: "Returns & Exchanges",
        contact: "Contact Us",
        about: "About Us",
        faq: "FAQ",
    };
    const content: Record<string, React.ReactNode> = {
        privacy: (
            <div className="space-y-4">
                <h2>Privacy Policy</h2>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h3>Information We Collect</h3>
                <p>We collect information you provide directly, such as your name, email address, phone number, and shipping address when you create an account or place an order.</p>
                <h3>How We Use Your Information</h3>
                <p>We use the information to process orders, send updates, personalize your experience, and improve our services.</p>
                <h3>Data Security</h3>
                <p>We implement industry-standard security measures to protect your personal information.</p>
                <h3>Contact</h3>
                <p>For privacy concerns, email us at mohammadtavakolikia66@gmail.com.</p>
            </div>
        ),
        terms: (
            <div className="space-y-4">
                <h2>Terms of Service</h2>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h3>Acceptance of Terms</h3>
                <p>By accessing and using Fashion Corner, you agree to be bound by these Terms of Service.</p>
                <h3>Accounts</h3>
                <p>You are responsible for maintaining the confidentiality of your account and password.</p>
                <h3>Orders</h3>
                <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order.</p>
                <h3>Intellectual Property</h3>
                <p>All content, designs, and trademarks are the property of Fashion Corner.</p>
            </div>
        ),
        shipping: (
            <div className="space-y-4">
                <h2>Shipping Policy</h2>
                <h3>Standard Shipping</h3>
                <p>Free standard shipping on orders over $100. Standard delivery takes 5-7 business days.</p>
                <h3>Express Shipping</h3>
                <p>Express delivery available for an additional fee. 2-3 business days.</p>
                <h3>International Shipping</h3>
                <p>We ship internationally. Delivery times and costs vary by destination.</p>
                <h3>Order Tracking</h3>
                <p>Tracking information will be sent to your email once your order ships.</p>
            </div>
        ),
        returns: (
            <div className="space-y-4">
                <h2>Returns & Exchanges</h2>
                <h3>Return Window</h3>
                <p>We accept returns within 30 days of delivery.</p>
                <h3>Conditions</h3>
                <p>Items must be unworn, unwashed, and in original condition with tags attached.</p>
                <h3>How to Return</h3>
                <p>Visit your Order History, select the item(s) you wish to return, and follow the instructions.</p>
                <h3>Refunds</h3>
                <p>Refunds are processed within 5-7 business days after we receive the returned item.</p>
            </div>
        ),
        contact: (
            <div className="space-y-4">
                <h2>Contact Us</h2>
                <p><strong>Email:</strong> mohammadtavakolikia66@gmail.com</p>
                <p><strong>Web:</strong> https://mohammadtavakolikia.ir</p>
                <p><strong>Hours:</strong> Monday–Friday, 9 AM – 6 PM EST</p>
            </div>
        ),
        about: (
            <div className="space-y-4">
                <h2>About Fashion Corner</h2>
                <p>Fashion Corner is your premier destination for trendy, timeless, and unique fashion. We curate collections from the world&apos;s most iconic brands and emerging designers.</p>
                <p>Our mission is to make high-quality fashion accessible to everyone, with a commitment to sustainability and ethical sourcing.</p>
                <p>Founded in 2024, we serve customers worldwide with fast shipping and exceptional customer service.</p>
            </div>
        ),
        faq: (
            <div className="space-y-4">
                <h2>Frequently Asked Questions</h2>
                <h3>How do I track my order?</h3>
                <p>Once your order ships, you&apos;ll receive a tracking number via email. You can also view it in your Order History.</p>
                <h3>What is your return policy?</h3>
                <p>We offer a 30-day return window for unworn items in original condition.</p>
                <h3>Do you ship internationally?</h3>
                <p>Yes, we ship to most countries. International shipping costs and delivery times vary.</p>
                <h3>How do I change or cancel my order?</h3>
                <p>Contact us within 2 hours of placing your order, and we&apos;ll do our best to accommodate changes.</p>
                <h3>Are your products authentic?</h3>
                <p>Absolutely. We source directly from authorized distributors and brand representatives.</p>
            </div>
        ),
    };

    const title = titles[slug] ?? slug;

    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title={title}
                badge="Fashion Corner"
                crumb={title}
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                {content[slug] ? (
                    <BlurFade inView>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h3]:text-foreground">
                            {content[slug]}
                        </div>
                    </BlurFade>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Page not found.</p>
                        <Link href="/" className="inline-block mt-4 text-primary hover:underline">Back to Home</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
