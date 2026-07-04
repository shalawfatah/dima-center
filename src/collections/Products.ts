import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    // Added barcode and brand to default columns for easier inventory lookups
    defaultColumns: ['title', 'brand', 'barcode', 'category', 'price', 'stock'],
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

    // === 📊 CORE INVENTORY & RETAIL FIELDS (Mapped from your raw dump) ===
    {
      type: 'row',
      fields: [
        {
          name: 'barcode',
          type: 'text',
          label: 'Barcode / UPC',
          admin: { width: '50%' },
        },
        {
          name: 'code',
          type: 'text',
          label: 'SKU / Internal Product Code',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Brand', // Maps to your raw 'brand' field
    },
    {
      name: 'price',
      type: 'number',
      label: 'Selling Price (Base)',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'costPriceUsd',
          type: 'number',
          label: 'Cost Price (USD)', // Maps to 'costPriceUsd'
          admin: { width: '50%' },
        },
        {
          name: 'costPriceIqd',
          type: 'number',
          label: 'Cost Price (IQD)', // Maps to 'costPriceIqd'
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      label: 'Current Stock (Quantity)', // Maps to your raw 'quantity'
      defaultValue: 0,
      required: true,
    },

    // === 📍 WAREHOUSE LOCATION BLOCK (Mapped from zone, aisle, shelf) ===
    {
      type: 'collapsible',
      label: 'Warehouse / Stock Location',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'zone', type: 'text', label: 'Zone', admin: { width: '33%' } },
            { name: 'aisle', type: 'text', label: 'Aisle', admin: { width: '33%' } },
            { name: 'shelf', type: 'text', label: 'Shelf', admin: { width: '33%' } },
          ],
        },
      ],
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

    // === TECHNICAL SPECS ARRAY ===
    {
      name: 'technicalSpecs',
      type: 'array',
      label: 'Technical Specifications',
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true, localized: true },
      ],
    },

    // === ✅ ROOT LEVEL MEDIA FIELDS ===
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      required: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'imagesGallery',
      type: 'array',
      label: 'Product Images Gallery',
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
