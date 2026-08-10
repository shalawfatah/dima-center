'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LocalizedHeading from '@/components/LocalizedHeading'
import PriceFilter from '@/components/PriceFilter'
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
  boxBodyColor?: string
  bodyColor?: string
  textColor?: string
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
  boxBodyColor,
  bodyColor,
  textColor,
}: FilteredCategoryViewProps) {
  // 1. Track both minimum and maximum filter values
  const [minPriceFilter, setMinPriceFilter] = useState<number>(0)
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(7000)

  const discountLabel: Record<string, string> = {
    en: 'OFF',
    ar: 'خصم',
    ckb: 'داشکاندن',
  }

  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  // 2. Filter products dynamically using both min and max boundaries
  const filteredProducts = allProducts.filter((product: any) => {
    const price = Number(product.price) || 0
    return price >= minPriceFilter && price <= maxPriceFilter
  })

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

          {/* 3. Pass min and color props properly to PriceFilter */}
          <PriceFilter
            minPrice={0}
            maxPrice={7000}
            defaultMin={0}
            defaultMax={7000}
            currencySymbol="$"
            currentLocale={currentLocale}
            cardBgColor={boxBgColor}
            borderColor={boxBorderColor}
            boxBodyColor={boxBodyColor}
            bodyColor={bodyColor}
            textColor={textColor}
            onFilterChange={(newMin, newMax) => {
              setMinPriceFilter(newMin)
              setMaxPriceFilter(newMax)
            }}
          />

          {filteredProducts.length === 0 ? (
            <div className="emptyState" style={{ fontFamily: 'var(--filtered-body-font)' }}>
              📦{' '}
              {currentLocale === 'ar'
                ? 'لا توجد منتجات مطابقة في هذه الفئة.'
                : currentLocale === 'ckb'
                  ? 'هیچ کاڵایەکی گونجاو لەم بەشەدا نییە.'
                  : 'No matching products found in this category.'}
            </div>
          ) : (
            <div className="productGrid">
              {filteredProducts.map((product: any) => {
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
