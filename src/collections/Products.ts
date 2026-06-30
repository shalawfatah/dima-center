import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'condition'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      name: 'condition',
      type: 'select',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Used', value: 'used' },
        { label: 'Refurbished', value: 'refurbished' },
        { label: 'Open Box', value: 'open_box' },
        { label: 'Used (Like New)', value: 'used_like_new' },
        { label: 'Used (No Box)', value: 'used_no_box' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Select the specific child category (e.g., CPU, Mouse)',
        // Optional UI cleanup: filter out parent categories in the selector
        // so administrators always choose the specific leaf node category.
        condition: () => true,
      },
    },
    {
      name: 'isOnSale',
      type: 'checkbox',
      label: 'Put on "Deals" section',
      defaultValue: false,
    },
    {
      name: 'salePrice',
      type: 'number',
      admin: {
        condition: (data) => data?.isOnSale,
      },
    },

    // === TECHNICAL SPECS ARRAY CLOSES CLEANLY HERE ===
    {
      name: 'technicalSpecs',
      type: 'array',
      label: 'Technical Specifications (JSON Fields)',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    }, // <-- Make sure this bracket closes the array field block!

    // === ✅ ROOT LEVEL FIELDS (PASTED AFTER THE ARRAY CLOSES) ===
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      required: false,
      admin: {
        position: 'sidebar', // This tells Payload to shove it to the right sidebar panel
      },
    },
    {
      name: 'imagesGallery',
      type: 'array',
      label: 'Product Images Gallery (Carousel)',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
