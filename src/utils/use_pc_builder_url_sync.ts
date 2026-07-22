import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface UsePcBuilderUrlSyncArgs {
  mounted: boolean
  products: any[]
  currentLocale: string
  setSelections: (updater: (prev: Record<string, any>) => Record<string, any>) => void
}

/**
 * Reads a `?parts=slot:productId,slot:productId` query param (used for
 * sharing a build link) and merges the matching products into selections
 * once, then strips the param from the URL.
 */
export function usePcBuilderUrlSync({
  mounted,
  products,
  currentLocale,
  setSelections,
}: UsePcBuilderUrlSyncArgs) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!mounted) return
    let partsParam = searchParams.get('parts')

    if (!partsParam && typeof window !== 'undefined') {
      const nativeParams = new URLSearchParams(window.location.search)
      partsParam = nativeParams.get('parts')
    }

    if (!partsParam) return

    try {
      const incomingParts = partsParam.split(',').reduce(
        (acc, pair) => {
          const [slotKey, productId] = pair.split(':')
          if (slotKey && productId) {
            const matchedProduct = products.find(
              (p) =>
                String(p.id) === String(productId) ||
                (p.code && String(p.code) === String(productId)),
            )

            if (matchedProduct) {
              acc[slotKey] = { ...matchedProduct, quantity: matchedProduct.quantity || 1 }
            }
          }
          return acc
        },
        {} as Record<string, any>,
      )

      if (Object.keys(incomingParts).length > 0) {
        setSelections((prev) => ({ ...prev, ...incomingParts }))
        const nextUrl = `/${currentLocale}/pc-builder`
        window.history.replaceState(null, '', nextUrl)
      }
    } catch (error) {
      console.error('System failed to process blueprint:', error)
    }
  }, [searchParams, products, setSelections, currentLocale, mounted])
}
