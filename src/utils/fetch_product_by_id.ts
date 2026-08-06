export async function fetchProductById(id: string, locale: string, payload: any) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id

  try {
    const product = await payload.findByID({
      collection: 'products',
      where: { stock: { greater_than: 0 } },
      id: numericId,
      locale,
      fallbackLocale: 'ckb',
      depth: 1,
    })
    if (product) return { product, collectionName: 'products' as const }
  } catch (err) {}

  try {
    const uiProduct = await payload.findByID({
      collection: 'ui-products',
      id: numericId,
      locale,
      fallbackLocale: 'ckb',
      depth: 1,
    })
    if (uiProduct) return { product: uiProduct, collectionName: 'ui-products' as const }
  } catch (err) {}

  return null
}
