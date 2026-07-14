// src/collections/Products.ts
import { CollectionConfig } from 'payload'
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'barcode', 'category', 'price', 'priceIQD', 'stock'],
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
    // === 📊 CORE INVENTORY & RETAIL FIELDS ===
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
      label: 'Brand',
    },
    // === 💵 DUAL CURRENCY PRICING ===
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Selling Price (USD)',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'priceIQD',
          type: 'number',
          label: 'Selling Price (IQD)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      label: 'Current Stock (Quantity)',
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
      admin: {
        position: 'sidebar',
        components: {
          // Use your tsconfig path alias to ensure the path-resolver always finds it
          Description: '@/components/FeaturedImagePreview#FeaturedImagePreview',
        },
      },
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
