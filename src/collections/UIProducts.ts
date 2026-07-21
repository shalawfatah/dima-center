import { CollectionConfig } from 'payload'

export const UIProducts: CollectionConfig = {
  slug: 'ui-products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'uiCategory', 'category', 'linkType', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true, // Supports EN, AR, CKB
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media', // Adjust to match your media collection slug
      required: false,
    },
    // --- Categorization ---
    {
      name: 'uiCategory',
      type: 'relationship',
      relationTo: 'ui-categories',
      required: true,
      admin: {
        description:
          'Determines where or how this item is displayed (e.g., Offers, Promotions, Banners).',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories', // Optional: link to standard product categories if applicable
      required: false,
      admin: {
        description:
          'Optional CRM/DB Category mapping if this UI item targets a specific catalog category.',
      },
    },
    // --- Link Handling (Flexible Routing) ---
    {
      name: 'linkType',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Link to CRM Product', value: 'product' },
        { label: 'Static URL / External Link', value: 'static' },
      ],
      admin: {
        description: 'Choose what happens when the user clicks this item.',
      },
    },
    {
      name: 'linkedProduct',
      type: 'relationship',
      relationTo: 'products', // Adjust to your standard CRM products collection slug
      required: true,
      admin: {
        condition: (data) => data?.linkType === 'product',
        description: 'Select the CRM product this item points to.',
      },
    },
    {
      name: 'staticUrl',
      type: 'text',
      required: true,
      admin: {
        condition: (data) => data?.linkType === 'static',
        description: 'Enter a custom route (e.g. /custom-landing) or external URL (https://...).',
      },
    },
    // --- Layout & Meta ---
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Sorting priority within its UI Category.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description:
          'Optional arbitrary key-value payload for custom UI attributes (badge labels, custom colors, specs).',
      },
    },
  ],
}
