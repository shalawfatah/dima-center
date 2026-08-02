interface TechSpec {
  id?: string
  key: string
  value: string
}

interface TechnicalSpecsTableProps {
  specs?: TechSpec[]
  currentLocale: string
  isRtl: boolean
  headingFont?: string
  bodyFont?: string
  titleColor?: string
  bodyColor?: string
}

const headingLabel: Record<string, string> = {
  ar: 'المواصفات التقنية',
  ckb: 'تایبەتمەندییە تەکنیكییەکان',
  en: 'Technical Specifications',
}

const emptyLabel: Record<string, string> = {
  ar: 'لا توجد مواصفات فنية متوفرة.',
  ckb: 'هیچ تایبەتمەندییەکی تەکنیكی بەردەست نییە.',
  en: 'No technical specifications available.',
}

export default function TechnicalSpecsTable({
  specs,
  currentLocale,
  isRtl,
  headingFont,
  bodyFont,
  titleColor,
  bodyColor,
}: TechnicalSpecsTableProps) {
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const bodyFontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#1e293b'
  const textColor = bodyColor || '#333333'

  return (
    <div style={{ marginTop: '3rem' }}>
      <h3
        style={{
          fontFamily: titleFont,
          color: headingColor,
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '0.5rem',
          marginBottom: '1rem',
          fontSize: '1.25rem',
          fontWeight: 'bold',
        }}
      >
        {headingLabel[currentLocale] || headingLabel.en}
      </h3>

      {specs && specs.length > 0 ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            textAlign: isRtl ? 'right' : 'left',
            fontFamily: bodyFontFamily,
            color: textColor,
          }}
        >
          <tbody>
            {specs.map((spec, idx) => (
              <tr key={spec.id || idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 'bold',
                    width: '35%',
                    borderBottom: '1px solid #eee',
                    color: textColor,
                    fontFamily: bodyFontFamily,
                  }}
                >
                  {spec.key}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #eee',
                    color: textColor,
                    fontFamily: bodyFontFamily,
                  }}
                >
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p
          style={{
            fontSize: '14px',
            padding: '1rem 0',
            fontFamily: bodyFontFamily,
            color: textColor,
          }}
        >
          {emptyLabel[currentLocale] || emptyLabel.en}
        </p>
      )}
    </div>
  )
}
