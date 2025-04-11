-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'ADMIN', 'SELLER');

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DOUBLE PRECISION NOT NULL,
    "addressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderitem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orderitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categorySlug" TEXT,
    "image" TEXT NOT NULL,
    "images" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "picture" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "clerkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "address"("userId");

-- CreateIndex
CREATE INDEX "Order_addressId_idx" ON "order"("addressId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "orderitem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "orderitem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_externalId_key" ON "product"("externalId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "product"("category");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "user"("clerkId");

-- CreateIndex
CREATE INDEX "Wishlist_productId_idx" ON "wishlist"("productId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON "wishlist"("userId", "productId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderitem" ADD CONSTRAINT "orderitem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderitem" ADD CONSTRAINT "orderitem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
