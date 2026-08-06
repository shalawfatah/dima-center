import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'
import { ProductPageProps } from '@/types/types'
import { resolveTitle } from '@/utils/resolve_title'
import { fetchProductById } from '@/utils/fetch_product_by_id'
import { resolveImageUrl } from '@/utils/resolve_image_url_single_product'

export async function generateProductMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id

  const baseMeta = await getStorefrontMetadata({ locale: currentLocale })

  try {
    const payload = await getPayload({ config })
    const result = await fetchProductById(productId, currentLocale, payload)

    if (!result) return baseMeta
    const { product } = result

    const title = resolveTitle(product, currentLocale)
    const description = typeof product.description === 'string' ? product.description : ''
    const imageUrl = resolveImageUrl(product) || undefined

    const titleValue = baseMeta?.title as any
    const baseSiteTitle =
      titleValue && typeof titleValue === 'object'
        ? titleValue.absolute || titleValue.default
        : typeof titleValue === 'string'
          ? titleValue
          : 'Storefront'

    return {
      ...baseMeta,
      title: `${title} | ${baseSiteTitle}`,
      description: description || baseMeta.description,
      openGraph: {
        ...baseMeta?.openGraph,
        title,
        description,
        type: 'video.other',
        ...(imageUrl && {
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: title,
            },
          ],
        }),
      },
    }
  } catch (error) {
    console.log('error ', error)
    return baseMeta
  }
}
