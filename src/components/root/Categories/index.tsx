"use client"

import Image from "next/image"
import Link from "next/link"
import AccessoriesCategoryIcon from "./icons/AccessoriesCategory.svg"
import KidsCategoryIcon from "./icons/KidsCategory.svg"
import ManCategoryIcon from "./icons/ManCategory.svg"
import ShoesCategoryIcon from "./icons/ShoesCategory.svg"
import SportCategoryIcon from "./icons/SportCategory.svg"
import WomenCategoryIcon from "./icons/WomenCategory.svg"


function CategoriesIcon() {
    const categoryList = [
        {
            title: "Women's Fashion",
            href: "/categories/womens",
            icon: WomenCategoryIcon
        },
        {
            title: "Men's Fashion",
            href: "/categories/mens",
            icon: ManCategoryIcon
        },
        {
            title: "Accessories",
            href: "/categories/accessories",
            icon: AccessoriesCategoryIcon
        },
        {
            title: "Kids & Baby",
            href: "/categories/kids",
            icon: KidsCategoryIcon
        },
        {
            title: "Sports & Activewear",
            href: "/categories/sports",
            icon: SportCategoryIcon
        },
        {
            title: "Shoes & Boots",
            href: "/categories/shoes",
            icon: ShoesCategoryIcon
        }
    ]

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categoryList.map((category, index) => (
                    <Link
                        href={category.href}
                        key={index}
                        className="group relative flex flex-col items-center"
                    >
                        <Image
                            src={category.icon}
                            alt={category.title}

                            width={100}
                            height={100}
                            className="bg-gradient-to-br border-[5px] mb-2 border-purple-400 from-fuchsia-500 to-fuchsia-900 transition-transform group-hover:scale-105 rounded-full"
                        />
                        <div className="text-center">
                            <h3 className="font-medium text-sm md:text-base">{category.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default CategoriesIcon