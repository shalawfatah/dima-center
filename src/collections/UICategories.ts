import { CollectionConfig } from 'payload'

export const UICategories: CollectionConfig = {
  slug: 'ui-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isContainer', 'hideInCarousel', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true, // Supports EN, AR, CKB
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      admin: {
        description:
          'Used for direct links (e.g., laptop, monitor). Leave empty if this is a main container.',
      },
    },
    {
      name: 'isContainer',
      type: 'checkbox',
      defaultValue: false,
      label: 'Is Parent Container (Has Dropdown Subcategories)?',
    },
    {
      name: 'hideInCarousel',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hide In Carousel',
      admin: {
        description:
          'If checked, this category will be ignored when fetching categories for UI carousels.',
      },
    },
    {
      name: 'subCategories',
      type: 'array',
      label: 'Sub Categories',
      admin: {
        condition: (data) => Boolean(data?.isContainer),
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          admin: {
            description: 'Slug matching the external ERP/db category slug (e.g., cpu, gpu).',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Used to control horizontal sorting in the UI.',
      },
    },
  ],
}
