export function resolveImageUrl(product: any): string | null {
  if (!product) return null
  let url: string | null = null

  if (typeof product.image === 'string' && product.image.trim()) {
    url = product.image
  } else if (typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
    url = product.imageUrl
  } else if (product.featuredImage) {
    if (typeof product.featuredImage === 'string') url = product.featuredImage
    else if (typeof product.featuredImage === 'object' && product.featuredImage?.url) {
      url = product.featuredImage.url
    }
  } else if (product.image && typeof product.image === 'object' && product.image?.url) {
    url = product.image.url
  } else if (Array.isArray(product.imagesGallery) && product.imagesGallery.length > 0) {
    const firstItem = product.imagesGallery[0]
    const galleryImg = firstItem?.image || firstItem
    if (typeof galleryImg === 'string') url = galleryImg
    else if (typeof galleryImg === 'object' && galleryImg?.url) url = galleryImg.url
  }

  if (!url || url.includes('placeholder.png')) {
    return null
  }

  return url
}
