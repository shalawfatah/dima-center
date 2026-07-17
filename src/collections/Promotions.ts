import { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'isActive'],
  },
  access: {
    read: () => true, // Publicly accessible for the frontend carousel
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true, // Localize for en, ar, ckb support
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media', // Points to your media collection
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'generic',
      options: [
        { label: 'Generic / News', value: 'generic' },
        { label: 'Product Feature', value: 'product' },
        { label: 'Offer', value: 'offer' }, // Changed 'event' to 'offer'
      ],
    },
    {
      name: 'relatedProduct',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      // Only show this field if the type is 'product'
      admin: {
        condition: (data) => data?.type === 'product',
      },
    },
    {
      name: 'relatedOffer',
      type: 'relationship',
      relationTo: 'case-offers',
      hasMany: false,
      // Only show this field if the type is 'offer'
      admin: {
        condition: (data) => data?.type === 'offer',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Custom Link URL',
      admin: {
        description:
          'Optional URL if this links to an external site or specific page instead of a product or offer.',
        condition: (data) => data?.type === 'generic', // Only show for generic types if they need an external override
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Visible on Homepage Carousel',
      defaultValue: true,
      index: true,
    },
  ],
}
