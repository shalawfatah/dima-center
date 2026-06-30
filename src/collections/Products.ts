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
        condition: () => true,
      },
    },

    // === 🏷️ DISCOUNT CONFIGURATION BLOCK ===
    {
      name: 'hasDiscount',
      type: 'checkbox',
      label: 'Apply Discount to this Product',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountType',
          type: 'select',
          label: 'Discount Type',
          defaultValue: 'fixed',
          options: [
            { label: 'Fixed Amount ($)', value: 'fixed' },
            { label: 'Percentage (%)', value: 'percentage' },
          ],
          admin: {
            condition: (data) => data?.hasDiscount,
            width: '50%',
          },
        },
        {
          name: 'discountValue',
          type: 'number',
          label: 'Discount Value',
          min: 0,
          admin: {
            condition: (data) => data?.hasDiscount,
            width: '50%',
          },
        },
      ],
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
    },

    // === ✅ ROOT LEVEL FIELDS ===
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      required: false,
      admin: {
        position: 'sidebar',
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
