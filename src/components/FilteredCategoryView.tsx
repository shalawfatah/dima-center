import Link from 'next/link'
import Image from 'next/image'
import LocalizedHeading from '@/components/LocalizedHeading'
import '@/styles/home-page-styles/filtered-category-view.css'

interface FilteredCategoryViewProps {
  currentLocale: string
  dirClass: string
  headingFont: string
  bodyFont: string
  dynamicFontFaceCSS: string
  matchedTitleEn: string | null
  matchedTitleAr: string | null
  matchedTitleCkb: string | null
  allProducts: any[]
  activeCategory: string
  boxBorderColor?: string
  boxBgColor?: string
}

export default function FilteredCategoryView({
  currentLocale,
  dirClass,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
  matchedTitleEn,
  matchedTitleAr,
  matchedTitleCkb,
  allProducts,
  boxBorderColor,
  boxBgColor,
}: FilteredCategoryViewProps) {
  const discountLabel: Record<string, string> = {
    en: 'OFF',
    ar: 'خصم',
    ckb: 'داشکاندن',
  }

  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div
        className={`pageWrapperFiltered ${dirClass}`}
        style={
          {
            '--filtered-heading-font': headingFont,
            '--filtered-body-font': bodyFont,
            ...(boxBorderColor ? { '--filtered-border-color': boxBorderColor } : {}),
            ...(boxBgColor ? { '--filtered-card-bg': boxBgColor } : {}),
          } as React.CSSProperties
        }
      >
        <main className="filteredMain">
          <div className="filteredHeader">
            <LocalizedHeading
              currentLocale={currentLocale}
              en={matchedTitleEn || 'Products'}
              ar={matchedTitleAr || 'المنتجات'}
              ckb={matchedTitleCkb || 'کاڵاکان'}
              headingFont={headingFont}
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
              }}
            />
            <Link
              href={`/${currentLocale}`}
              className="showAllLink"
              style={{ fontFamily: 'var(--filtered-body-font)' }}
            >
              {currentLocale === 'ar'
                ? '← عرض الكل'
                : currentLocale === 'ckb'
                  ? '← گەڕانەوە'
                  : '← Show All'}
            </Link>
          </div>

          {allProducts.length === 0 ? (
            <div className="emptyState" style={{ fontFamily: 'var(--filtered-body-font)' }}>
              📦{' '}
              {currentLocale === 'ar'
                ? 'لا توجد منتجات في هذه الفئة حالياً.'
                : currentLocale === 'ckb'
                  ? 'هیچ کاڵایەک لەم بەشەدا نییە.'
                  : 'No products found in this category.'}
            </div>
          ) : (
            <div className="productGrid">
              {allProducts.map((product: any) => {
                const imgData = product.featuredImage || product.image
                let imageUrl: string | null = null

                if (typeof imgData === 'string') {
                  imageUrl = imgData
                } else if (typeof imgData === 'object' && imgData?.url) {
                  imageUrl = imgData.url
                }

                const productHref = resolveProductHref(product.id, !!product.isCaseOffer)
                const hasDiscount = product.hasDiscount || false
                const discountLabelText =
                  discountLabel[currentLocale as keyof typeof discountLabel] || 'OFF'

                return (
                  <Link key={product.id} href={productHref} className="productCardLink">
                    <div className="productCard">
                      {hasDiscount && (
                        <div className="discountBadge">
                          {product.discountType === 'percentage'
                            ? `-${product.discountValue}% ${discountLabelText}`
                            : `-$${product.discountValue} ${discountLabelText}`}
                        </div>
                      )}
                      <div className="productImageWrapper">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            width={200}
                            height={200}
                            alt={product.title || 'Product'}
                            className="productImage"
                          />
                        ) : (
                          <span
                            className="productImagePlaceholder"
                            style={{ fontFamily: 'var(--filtered-body-font)' }}
                          >
                            📦
                          </span>
                        )}
                      </div>
                      <h3
                        className="productTitle"
                        style={{
                          fontFamily: 'var(--filtered-heading-font)',
                          fontWeight: '600',
                        }}
                      >
                        {product.title}
                      </h3>
                      <div
                        className="productPrice"
                        style={{ fontFamily: 'var(--filtered-body-font)' }}
                      >
                        {product.price !== null && product.price !== undefined
                          ? `$${product.price}`
                          : ''}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
