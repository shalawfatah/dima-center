interface Product {
  title: string
  price: string
  image?: string
  url: string
}

export function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1) // drop leading 0
  if (!digits.startsWith('964')) digits = '964' + digits // add country code if missing
  return digits
}

export function createOrder(
  product: Product,
  buyerNumber: string,
  sellerNumber: string = '9647701414269',
): string {
  const message: string =
    `New order request 🛒\n` +
    `*${product.title}*\n` +
    `Price: ${product.price}\n` +
    `Buyer: ${buyerNumber}\n` +
    `Link: ${product.url}`

  const cleanSellerNumber: string = normalizeIraqiNumber(sellerNumber)
  const encodedMessage: string = encodeURIComponent(message)
  return `https://wa.me/${cleanSellerNumber}?text=${encodedMessage}`
}
