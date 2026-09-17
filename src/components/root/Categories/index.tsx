"use client"

import Image from "next/image"
import Link from "next/link"
import { MagicCard } from "@/components/magicui/magic-card"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import WomenCategoryIcon from "./icons/WomenCategory.svg"
import MenCategoryIcon from "./icons/ManCategory.svg"
import AccessoriesCategoryIcon from "./icons/AccessoriesCategory.svg"
import KidsCategoryIcon from "./icons/KidsCategory.svg"
import SportCategoryIcon from "./icons/SportCategory.svg"
import ShoesCategoryIcon from "./icons/ShoesCategory.svg"


function CategoriesIcon() {
    const categoryList = [
        {
            title: "Women's Fashion",
            href: "/categories/womens",
            icon: WomenCategoryIcon,
            color: "from-pink-400 to-rose-500",
            gradientFrom: "#f472b6",
            gradientTo: "#f43f5e"
        },
        {
            title: "Men's Fashion",
            href: "/categories/mens",
            icon: MenCategoryIcon,
            color: "from-blue-400 to-indigo-500",
            gradientFrom: "#60a5fa",
            gradientTo: "#6366f1"
        },
        {
            title: "Accessories",
            href: "/categories/accessories",
            icon: AccessoriesCategoryIcon,
            color: "from-purple-400 to-pink-500",
            gradientFrom: "#c084fc",
            gradientTo: "#ec4899"
        },
        {
            title: "Kids & Baby",
            href: "/categories/kids",
            icon: KidsCategoryIcon,
            color: "from-yellow-400 to-orange-500",
            gradientFrom: "#facc15",
            gradientTo: "#f97316"
        },
        {
            title: "Sports & Activewear",
            href: "/categories/sports",
            icon: SportCategoryIcon,
            color: "from-green-400 to-teal-500",
            gradientFrom: "#4ade80",
            gradientTo: "#14b8a6"
        },
        {
            title: "Shoes & Boots",
            href: "/categories/shoes",
            icon: ShoesCategoryIcon,
            color: "from-orange-400 to-red-500",
            gradientFrom: "#fb923c",
            gradientTo: "#ef4444"
        }
    ]

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <BlurFade inView>
                    <span className="inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 mb-4 text-purple-600 dark:text-purple-300">
                        <AnimatedShinyText>Browse the collections</AnimatedShinyText>
                    </span>
                </BlurFade>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <AnimatedGradientText
                        colorFrom="#ffaa40"
                        colorTo="#9c40ff"
                        speed={1.5}
                    >
                        Shop by Category
                    </AnimatedGradientText>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Discover curated collections tailored to your style
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categoryList.map((category, index) => (
                    <BlurFade key={index} delay={0.05 * index} inView>
                        <Link
                            href={category.href}
                            className="group block h-full"
                        >
                            <MagicCard
                                mode="gradient"
                                gradientFrom={category.gradientFrom}
                                gradientTo={category.gradientTo}
                                gradientOpacity={0.3}
                                gradientSize={200}
                                className="relative aspect-square rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl group-hover:shadow-2xl h-full"
                            >
                                <div className={`relative w-16 h-16 mb-4 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300`}>
                                    <Image
                                        src={category.icon}
                                        alt={category.title}
                                        width={48}
                                        height={48}
                                        className="bg-white/20 rounded-full"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-medium text-sm md:text-base text-foreground">{category.title}</h3>
                                </div>
                            </MagicCard>
                        </Link>
                    </BlurFade>
                ))}
            </div>
        </div>
    )
}

export default CategoriesIcon
