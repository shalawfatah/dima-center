const DEFAULT_BASE_URL = 'https://saaser.tadbeersoft.com'
const DEFAULT_PREFIX = '/api/public/cms'

export function getBruskConfig() {
  const BASE_URL = (process.env.BRUSK_BASE_URL || DEFAULT_BASE_URL).trim()
  const PREFIX = (process.env.BRUSK_CMS_PREFIX || DEFAULT_PREFIX).trim()
  const API_KEY = (process.env.BRUSK_API_KEY || '').trim()
  const SECRET_KEY = (process.env.BRUSK_SECRET_KEY || '').trim()
  const BRANCH_ID = (process.env.BRUSK_BRANCH_ID || '').trim()

  if (!API_KEY || !SECRET_KEY || !BRANCH_ID) {
    throw new Error('Missing Bruska environment credentials.')
  }

  const requestHeaders = new Headers()
  requestHeaders.append('apikey', API_KEY)
  requestHeaders.append('secretkey', SECRET_KEY)

  return {
    baseUrl: BASE_URL,
    prefix: PREFIX,
    branchId: BRANCH_ID,
    requestHeaders,
  }
}
