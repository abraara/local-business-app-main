import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '@/lib/access';

export const Orders: CollectionConfig = {
    slug: 'orders',
    access: {
        read: ({ req }) => Boolean(req.user),
        create: ({ req }) => isSuperAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
        delete: ({ req }) => isSuperAdmin(req.user),
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            hasMany: false,
            required: true,
        },
        {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            hasMany: false,
            required: true,
        },
        {
            name: 'stripeCheckoutSessionId',
            type: 'text',
            required: true,
            admin: {
                description: 'The ID of the Stripe Checkout Session for this order.',
            },
        },
        {
            name: 'stripeAccountId',
            type: 'text',
            admin: {
                description: 'Stripe account associated with this order.',
            },
        },
    ],
};