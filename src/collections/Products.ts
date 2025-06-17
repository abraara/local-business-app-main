import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '@/lib/access'
import { Tenant } from '@/payload-types';

export const Products: CollectionConfig = {
    slug: 'products',
    access: {
        create: ({ req }) => {
            if (isSuperAdmin(req.user)) return true;

            const tenant = req.user?.tenants?.[0]?.tenant as Tenant;

            return Boolean(tenant?.stripeDetailsSubmitted);
        },
        delete: ({ req }) => isSuperAdmin(req.user),
    },
    admin: {
        useAsTitle: 'name',
        description: 'You must verify your Stripe account before creating products.',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'richText',
        },
        {
            name: 'price',
            type: 'number',
            required: true,
            admin: {
                description: 'Price in CAD',
            },
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: false,
        },
        {
            name: 'tags',
            type: 'relationship',
            relationTo: 'tags',
            hasMany: true,
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'cover',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'image2',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'image3',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'image4',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'image5',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: "refundPolicy",
            type: "select",
            options: [
                "30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"
            ],
            defaultValue: "30-day",
        },
        {
            name: 'content',
            type: 'richText',
            admin: {
                description: "Protected content that will be visible only to users who purchased this product. Add product documentation, downloadable files, bonus materials, etc. Supports Markdown syntax.",
            }
        },
        {
            name: 'isArchived',
            type: 'checkbox',
            defaultValue: false,
            label: 'Archive',
            admin: {
                description: 'Check this box to archive the product. Archived products will not be visible in the store.',
            }
        },
        {
            name: 'isPrivate',
            type: 'checkbox',
            defaultValue: false,
            label: 'Private',
            admin: {
                description: 'Check this box to make the product private. Private products will not be visible in the public marketplace, but can be purchased via tenants storefronts or via direct links.',
            }
        }
    ],
}