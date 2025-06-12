import { isSuperAdmin } from '@/lib/access'
import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: 'slug',
  },
  fields: [
    {
      name: 'name',
      required: true,
      type: 'text',
      label: 'Store Name',
      admin: {
        description: 'The name of the store'
      }
    },
    {
        name: 'slug',
        type: 'text',
        unique: true,
        required: true,
        index: true,
        access: {
            update: ({ req }) => isSuperAdmin(req.user),
        },
        admin: {
          description: 'Unique identifier for the store, used in URLs',
        },
    },
    {
        relationTo: 'media',
        type: 'upload',
        name: 'image',
    },
    {
        name: 'stripeAccountId',
        type: 'text',
        required: true,
        access: {
            update: ({ req }) => isSuperAdmin(req.user),
        },
        admin: {
            description: 'Stripe account ID associated with your shop.',
        },
    },
    {
        name: 'stripeDetailsSubmitted',
        type: 'checkbox',
        access: {
            update: ({ req }) => isSuperAdmin(req.user),
        },
        admin: {
            description: 'You cannot create products until you submit your Stripe account details.',
        },
    },
  ],
}
