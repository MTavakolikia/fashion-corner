"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from "next/image"


export function Navigation() {

  const brands = [
    {
      title: "Louis Vuitton",
      href: "/brands/louis-vuitton",
      description: "Luxury leather goods and fashion"
    },
    {
      title: "Gucci",
      href: "/brands/gucci",
      description: "Italian luxury fashion house"
    },
    {
      title: "Prada",
      href: "/brands/prada",
      description: "High-end Italian fashion"
    },
    {
      title: "Hermès",
      href: "/brands/hermes",
      description: "French luxury goods manufacturer"
    },
    {
      title: "Burberry",
      href: "/brands/burberry",
      description: "British luxury fashion house"
    },
    {
      title: "Dior",
      href: "/brands/dior",
      description: "French luxury fashion house"
    },
    {
      title: "Chanel",
      href: "/brands/chanel",
      description: "French luxury fashion house"
    },
    {
      title: "Fendi",
      href: "/brands/fendi",
      description: "Italian luxury fashion house"
    }
  ]
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/categories"
                  >
                    <Image src="/images/fashion-corner.png" alt="logo" width={33} height={30} />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Fashion Categories
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Explore our curated collection of trendy fashion items across all categories.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/categories/womens" title="Women&apos;s Fashion">
                Discover our latest collection of women&apos;s clothing, accessories, and footwear.
              </ListItem>
              <ListItem href="/categories/mens" title="Men&apos;s Fashion">
                Browse through our selection of men&apos;s apparel, shoes, and accessories.
              </ListItem>
              <ListItem href="/categories/accessories" title="Accessories">
                Complete your look with our range of bags, jewelry, and fashion accessories.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Brands</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2 ">
              {brands.map((brand) => (
                <ListItem
                  key={brand.title}
                  title={brand.title}
                  href={brand.href}
                >
                  {brand.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/new-arrivals" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New Arrivals
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/sale" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Sale
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
