import { GlobalConfig } from 'payload'

export const GeneralSettings: GlobalConfig = {
  slug: 'general-settings',
  label: 'General Settings',
  admin: {
    group: 'System', // Organizes it into a sidebar group
  },
  fields: [
    // === 🏢 COMPANY INFORMATION ===
    {
      name: 'slogan',
      type: 'text',
      label: 'Slogan',
      localized: true, // Localized so you can have it in en, ckb, ar
    },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      label: 'Company Logo',
      required: false,
    },

    // === 📊 FINANCIAL CONFIGURATION ===
    {
      name: 'exchangeRate',
      type: 'number',
      label: 'Daily Exchange Rate (1 USD to IQD)',
      defaultValue: 1500, // Typically 1500 or 1320 depending on market/official rate
      required: true,
      admin: {
        description: 'Used across the system to calculate IQD pricing dynamically.',
      },
    },

    // === 📞 CONTACT DETAILS ===
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'text',
          label: 'Contact Email',
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Contact Phone Number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Physical Address',
      localized: true, // Addresses change format/script depending on language
    },

    // === 🌐 SOCIAL MEDIA LINKS ===
    {
      name: 'socials',
      type: 'array',
      label: 'Social Media Profiles',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              admin: { width: '40%' },
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'LinkedIn', value: 'linkedin' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              label: 'Profile Link / URL',
              required: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
  ],
}
