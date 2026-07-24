import Link from 'next/link'
import Image, { StaticImageData } from 'next/image'

// Extended union to handle Payload's unpopulated ID types (number/string)
export type MediaItem =
  | {
      url?: string
      alt?: string
    }
  | StaticImageData
  | string
  | number
  | null
  | undefined

export interface LogoComponentProps {
  currentLocale: string
  logoImg?: MediaItem
  eventLogoSticker?: MediaItem
}

export default function LogoComponent({
  currentLocale,
  logoImg,
  eventLogoSticker,
}: LogoComponentProps) {
  // Helper to extract a valid src for Next.js Image component
  const getMediaSrc = (media?: MediaItem): string | StaticImageData | null => {
    if (!media || typeof media === 'number') return null // Ignore unpopulated numerical IDs
    if (typeof media === 'string') return media
    if (typeof media === 'object' && 'url' in media && media.url) return media.url
    if (typeof media === 'object' && 'src' in media) return media as StaticImageData
    return null
  }

  const logoSrc = getMediaSrc(logoImg)
  const stickerSrc = getMediaSrc(eventLogoSticker)

  return (
    <Link
      href={`/${currentLocale}`}
      className="logo-link-container"
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Primary Logo */}
      {logoSrc && (
        <Image
          src={logoSrc}
          alt="Company Logo"
          width={95}
          height={55}
          style={{ height: 'auto', maxWidth: '100%' }}
          priority
        />
      )}

      {/* Top-Right Event Sticker */}
      {stickerSrc && (
        <div
          className="event-sticker-wrapper"
          style={{
            position: 'absolute',
            top: -6,
            right: -10,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <Image
            src={stickerSrc}
            alt="Event Sticker"
            width={32}
            height={32}
            style={{ height: 'auto', width: 'auto', objectFit: 'contain' }}
          />
        </div>
      )}
    </Link>
  )
}
