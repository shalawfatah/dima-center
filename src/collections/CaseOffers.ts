import { CollectionConfig } from 'payload'

export const CaseOffers: CollectionConfig = {
  slug: 'case-offers',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'discountedPrice', 'updatedAt'],
    group: 'Offers', // Groups it neatly in your Payload sidebar
  },
  access: {
    read: () => true, // Publicly readable for your storefront page
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true, // Translates "Full Build Offers", "ئۆفەری کەیس", and Arabic
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'Used in the URL (e.g., mega-gaming-pc-offer)',
      },
    },
    {
      name: 'featured_image',
      type: 'relationship',
      relationTo: 'media', // Connects directly to your Media collection
      required: true,
    },
    {
      name: 'description',
      type: 'richText', // Rich text editor for structured specs, parts lists, and details
      localized: true, // Translates descriptions for your Kurdish/Arabic/English audiences
    },
    {
      type: 'row', // Aligns pricing fields side-by-side in the admin UI
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          admin: {
            description: 'Original retail price of the full build',
          },
        },
        {
          name: 'discountedPrice',
          type: 'number',
          admin: {
            description: 'Optional promotional price (leave blank if not discounted)',
          },
        },
      ],
    },
  ],
}
