import { ExternalInventory, ExternalStock } from '@/types/brusk_types'

export async function fetchStockByBarcode(
  baseUrl: string,
  prefix: string,
  branchId: string,
  requestHeaders: Headers,
  logger: any,
): Promise<Record<string, number>> {
  const timestamp = Date.now()
  const stockByBarcode: Record<string, number> = {}

  try {
    const invRes = await fetch(
      `${baseUrl}${prefix}/inventories?branchId=${branchId}&t=${timestamp}`,
      { method: 'GET', headers: requestHeaders, cache: 'no-store' },
    )

    if (!invRes.ok) {
      logger.info('⚠️ Could not fetch inventories — falling back to items[].quantity.')
      return stockByBarcode
    }

    const invData = await invRes.json()
    const inventories: ExternalInventory[] = invData.inventories || []
    logger.info(`Found ${inventories.length} inventories to pull stock from.`)

    for (const inv of inventories) {
      const stockUrl = `${baseUrl}${prefix}/stocks?inventoryId=${inv._id}&branchId=${branchId}&t=${timestamp}`
      const stockRes = await fetch(stockUrl, {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store',
      })

      if (!stockRes.ok) {
        const bodyText = await stockRes.text().catch(() => '<unreadable>')
        logger.info(
          `⚠️ Could not fetch stocks for inventory ${inv.name} (${inv._id}) — status ${stockRes.status}: ${bodyText}`,
        )
        continue
      }

      const stockData = await stockRes.json()
      const stocks: ExternalStock[] = stockData.stocks || []

      for (const s of stocks) {
        const barcode = (s.barcode || s.code || '').trim()
        if (!barcode) continue
        stockByBarcode[barcode] = (stockByBarcode[barcode] || 0) + (s.totalQuantity || 0)
      }
    }

    logger.info(`Aggregated stock for ${Object.keys(stockByBarcode).length} distinct barcodes.`)
  } catch (stockErr) {
    console.error('⚠️ Stock fetch failed, falling back to items[].quantity:', stockErr)
  }

  return stockByBarcode
}
