// Helper to safely extract image string from various Payload & UI data structures
function resolveImageUrl(product: any): string | null {
  if (!product) return null

  let url: string | null = null

  // 1. Direct string on product.image or product.imageUrl
  if (typeof product.image === 'string' && product.image.trim()) {
    url = product.image
  } else if (typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
    url = product.imageUrl
  }

  // 2. Raw Payload `featuredImage`
  else if (product.featuredImage) {
    if (typeof product.featuredImage === 'string') url = product.featuredImage
    else if (typeof product.featuredImage === 'object' && product.featuredImage?.url) {
      url = product.featuredImage.url
    }
  }

  // 3. Raw Payload `image` object
  else if (product.image && typeof product.image === 'object' && product.image?.url) {
    url = product.image.url
  }

  // 4. Raw Payload `imagesGallery` array fallback
  else if (Array.isArray(product.imagesGallery) && product.imagesGallery.length > 0) {
    const firstItem = product.imagesGallery[0]
    const galleryImg = firstItem?.image || firstItem
    if (typeof galleryImg === 'string') url = galleryImg
    else if (typeof galleryImg === 'object' && galleryImg?.url) url = galleryImg.url
  }

  // Guard against relative placeholders or invalid paths breaking next/image
  if (!url || url.includes('placeholder.png') || url.startsWith('/')) {
    // If it's a real local public asset like '/uploads/file.png', allow it
    if (url && url.startsWith('/uploads/')) {
      return url
    }
    return null
  }

  return url
}
