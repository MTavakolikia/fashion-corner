import { z } from "zod";

export const shippingAddressSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

export const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().positive("Price must be positive"),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    shippingAddress: shippingAddressSchema,
    total: z.number().positive("Total must be positive"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>; 