export function resolveTitle(product: any, locale: string): string {
  if (!product) return 'Untitled Product'

  let titleProp =
    product.title || product.name || product.productName || product.label || product.title_en

  if (!titleProp) return 'Untitled Product'

  if (typeof titleProp === 'string' && titleProp.trim().startsWith('{')) {
    try {
      titleProp = JSON.parse(titleProp)
    } catch {}
  }

  if (typeof titleProp === 'string' && titleProp.trim() !== '') {
    return titleProp.trim()
  }

  if (typeof titleProp === 'object' && titleProp !== null) {
    if (titleProp.root || Array.isArray(titleProp.children)) {
      try {
        const children = titleProp.root?.children || titleProp.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch {}
    }

    const match =
      titleProp[locale] ||
      titleProp.en ||
      titleProp.ar ||
      titleProp.ckb ||
      Object.values(titleProp).find((v) => typeof v === 'string' && v.trim() !== '')

    if (typeof match === 'string' && match.trim() !== '') {
      return match.trim()
    }
  }

  return 'Untitled Product'
}
