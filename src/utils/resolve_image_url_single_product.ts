export function resolveImageUrl(product: any): string | null {
  if (!product) return null

  const img = product.image
  if (typeof img === 'string' && img.startsWith('http')) return img
  if (typeof img === 'object' && img?.url) return img.url

  const featured = product.featuredImage
  if (typeof featured === 'string' && featured.startsWith('http')) return featured
  if (typeof featured === 'object' && featured?.url) return featured.url

  if (Array.isArray(product.imagesGallery) && product.imagesGallery.length > 0) {
    const first = product.imagesGallery[0]
    const firstImg = typeof first === 'object' ? first?.image || first : first
    if (typeof firstImg === 'string' && firstImg.startsWith('http')) return firstImg
    if (typeof firstImg === 'object' && firstImg?.url) return firstImg.url
  }

  return null
}
