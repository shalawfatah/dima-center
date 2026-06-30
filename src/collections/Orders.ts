import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'phoneNumber', 'paymentMethod', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'deliveryAddress',
      type: 'textarea',
      admin: {
        condition: (data) => data?.paymentMethod === 'cash_on_delivery',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'In-Store Pickup', value: 'in_store' },
        { label: 'Cash on Delivery (COD)', value: 'cash_on_delivery' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending / New Order', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready for Pickup / Out for Delivery', value: 'ready' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    // Relational field linking straight back to your Products collection
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
        },
        {
          name: 'priceAtPurchase',
          type: 'number',
          required: true,
          admin: {
            description:
              'Snapshotted price to protect historical logs if item prices change later.',
          },
        },
      ],
    },
    {
      name: 'totalOrderAmount',
      type: 'number',
      required: true,
    },
  ],
}
