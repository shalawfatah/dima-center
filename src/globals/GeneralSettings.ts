import { GlobalConfig } from 'payload'

export const GeneralSettings: GlobalConfig = {
  slug: 'general-settings',
  label: 'General Settings',
  admin: {
    group: 'System', // Organizes it into a sidebar group
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'admin',
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
      type: 'row',
      fields: [
        {
          name: 'logo',
          type: 'relationship',
          relationTo: 'media',
          label: 'Company Logo',
          required: false,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'logoBackgroundColor',
          type: 'text',
          label: 'Logo Background Color',
          defaultValue: 'transparent',
          admin: {
            width: '50%',
            description: 'Enter a valid CSS color (e.g., #fff, transparent, or rgba(0,0,0,0.5)).',
          },
        },
      ],
    },
    // === 🎨 SITE BACKGROUND ===
    {
      name: 'siteBackground',
      type: 'group',
      label: 'Site Background',
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Overall Background Color',
          defaultValue: '#ffffff',
          admin: {
            description:
              'Sets the default background color for the entire site (e.g. #ffffff, #0f172a, or transparent).',
          },
        },
      ],
    },
    // === 🎨 TYPOGRAPHY & FONTS ===
    {
      name: 'typography',
      type: 'group',
      label: 'Typography & Custom Fonts',
      fields: [
        // --- Global Typography Colors ---
        {
          type: 'row',
          fields: [
            {
              name: 'titleColor',
              type: 'text',
              label: 'Title / Heading Color',
              defaultValue: '#000000',
              admin: {
                width: '33.33%',
                description: 'Default color for h1, h2, h3, etc. (e.g. #000000 or #f8fafc).',
              },
            },
            {
              name: 'bodyColor',
              type: 'text',
              label: 'Body Text Color',
              defaultValue: '#333333',
              admin: {
                width: '33.33%',
                description:
                  'Default color for paragraphs and general text (e.g. #333333 or #94a3b8).',
              },
            },
            {
              name: 'boxBackgroundColor',
              type: 'text',
              label: 'Box Background Color',
              defaultValue: '#f8fafc',
              admin: {
                width: '33.33%',
                description:
                  'Background color for cards, boxes, or callout containers (e.g. #f8fafc or #1e293b).',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'boxBorderColor',
              type: 'text',
              label: 'Box Border Color',
              defaultValue: '#e0d6c6',
              admin: {
                width: '50%',
                description:
                  'Border color for cards, boxes, or containers (e.g. #e0d6c6 or transparent).',
              },
            },
          ],
        },
        // --- Kurdish Fonts ---
        {
          name: 'kurdish',
          type: 'group',
          label: 'Kurdish Fonts',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'headingFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'Kurdish Heading Font',
                  admin: { width: '50%' },
                },
                {
                  name: 'bodyFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'Kurdish Body Font',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        // --- Arabic Fonts ---
        {
          name: 'arabic',
          type: 'group',
          label: 'Arabic Fonts',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'headingFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'Arabic Heading Font',
                  admin: { width: '50%' },
                },
                {
                  name: 'bodyFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'Arabic Body Font',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        // --- English Fonts ---
        {
          name: 'english',
          type: 'group',
          label: 'English Fonts',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'headingFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'English Heading Font',
                  admin: { width: '50%' },
                },
                {
                  name: 'bodyFont',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'English Body Font',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    // === 💻 PC BUILDER SETTINGS ===
    {
      name: 'pcBuilder',
      type: 'group',
      label: 'PC Builder Configuration',
      fields: [
        {
          name: 'backgroundImage',
          type: 'relationship',
          relationTo: 'media',
          label: 'Background Image',
          required: false,
        },
        {
          name: 'foregroundImage',
          type: 'relationship',
          relationTo: 'media',
          label: 'Foreground Image',
          required: false,
        },
      ],
    },
    // === 🎨 HEADER & STYLING ===
    {
      name: 'header',
      type: 'group',
      label: 'Header Configuration',
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Header Background Color',
          admin: {
            description: 'Enter a valid CSS color code (e.g. #1E293B or rgba(0,0,0,0.8)).',
          },
        },
        {
          name: 'eventLogoSticker',
          type: 'relationship',
          relationTo: 'media',
          label: 'Event Logo Sticker',
          required: false,
        },
      ],
    },
    // === 🧭 NAVBAR CONFIGURATION ===
    {
      name: 'navbar',
      type: 'group',
      label: 'Navbar Configuration',
      fields: [
        {
          name: 'width',
          type: 'select',
          label: 'Navbar Width',
          defaultValue: 'full',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Fit Content / Centered', value: 'fit-content' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'backgroundColor',
              type: 'text',
              label: 'Navbar Background Color',
              admin: {
                width: '50%',
                description: 'e.g. #ffb83c or transparent',
              },
            },
            {
              name: 'textColor',
              type: 'text',
              label: 'Navbar Text / Item Color',
              admin: {
                width: '50%',
                description: 'e.g. #000000 or #ffffff',
              },
            },
          ],
        },
      ],
    },
    // === 📊 FINANCIAL CONFIGURATION ===
    {
      name: 'exchangeRate',
      type: 'number',
      label: 'Daily Exchange Rate (1 USD to IQD)',
      defaultValue: 1500,
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
      localized: true,
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
