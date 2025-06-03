import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
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
        admin: {
            readOnly: true,
        },
    },
    {
        name: 'stripeDetailsSubmitted',
        type: 'checkbox',
        admin: {
            readOnly: true,
            description: 'You cannot create products until you submit your Stripe account details.',
        },
    },
  ],
}
