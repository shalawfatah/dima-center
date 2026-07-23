// src/collections/Events.ts
import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'bannerHeight', 'mediaType', 'isActive', 'updatedAt'],
  },
  fields: [
    // === 🔘 DISPLAY STATUS & SETTINGS ===
    {
      type: 'row',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Display on Website',
          defaultValue: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'textColor',
          type: 'select',
          label: 'Text Color',
          defaultValue: 'light',
          options: [
            { label: 'Light (White)', value: 'light' },
            { label: 'Dark (Black/Dark Gray)', value: 'dark' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bannerHeight',
          type: 'select',
          label: 'Banner Height',
          required: true,
          defaultValue: 'medium',
          options: [
            { label: 'Small (100px)', value: 'small' },
            { label: 'Medium (300px)', value: 'medium' },
            { label: 'Large (600px)', value: 'large' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'mediaType',
          type: 'select',
          label: 'Background Type',
          required: true,
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'SVG Raw/Code', value: 'svg' },
            { label: 'Video', value: 'video' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },

    // === 📝 CONTENT ===
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

    // === 🖼️ BACKGROUND MEDIA CONFIGURATION ===
    {
      name: 'backgroundImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        condition: (data) => data?.mediaType === 'image',
      },
    },
    {
      name: 'backgroundSvg',
      type: 'code',
      label: 'Background SVG Code or URL',
      admin: {
        language: 'html',
        description: 'Paste inline <svg> markup or external SVG URL here',
        condition: (data) => data?.mediaType === 'svg',
      },
    },
    {
      name: 'backgroundVideo',
      type: 'relationship',
      relationTo: 'media',
      label: 'Background Video File',
      admin: {
        description: 'Upload MP4 / WebM file from media gallery',
        condition: (data) => data?.mediaType === 'video',
      },
    },

    // === 🔗 OPTIONAL LINK / CTA ===
    {
      name: 'enableLink',
      type: 'checkbox',
      label: 'Add Clickable Link / Button',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Link Target URL',
          admin: {
            condition: (data) => data?.enableLink,
            width: '50%',
          },
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Button / Link Text',
          localized: true,
          admin: {
            condition: (data) => data?.enableLink,
            width: '30%',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in New Tab',
          defaultValue: false,
          admin: {
            condition: (data) => data?.enableLink,
            width: '20%',
          },
        },
      ],
    },

    // === ⏰ OPTIONAL SCHEDULING (SIDEBAR) ===
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Start Displaying On',
          admin: {
            position: 'sidebar',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Stop Displaying On',
          admin: {
            position: 'sidebar',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
  ],
}
