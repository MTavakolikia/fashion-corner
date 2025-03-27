"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { shippingAddressSchema, type CreateOrderInput } from '@/lib/validations/order';
import { toast } from 'react-hot-toast';

interface ShippingFormProps {
    onSubmit: (data: CreateOrderInput['shippingAddress']) => void;
    isSubmitting: boolean;
}

export function ShippingForm({ onSubmit, isSubmitting }: ShippingFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = shippingAddressSchema.parse(formData);
            onSubmit(validatedData);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name
                </label>
                <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Address
                </label>
                <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                    </label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State
                    </label>
                    <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                        <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        ZIP Code
                    </label>
                    <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                        <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone
                    </label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
        </form>
    );
} 