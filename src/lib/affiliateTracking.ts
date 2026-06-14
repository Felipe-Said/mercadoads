import { supabase } from './supabase'

const STORAGE_KEY = 'cookie-market-affiliate-ref'
const PRODUCT_STORAGE_KEY = 'cookie-market-affiliate-product'

type AffiliateSaleFields = {
  affiliate_user_id?: string
  affiliate_commission_percent?: number
  affiliate_commission_amount?: number
  affiliate_ref_product_id?: number
}

export function storeAffiliateRefFromSearch(search: string, pathname = '') {
  if (typeof window === 'undefined') return

  const ref = new URLSearchParams(search).get('ref')?.trim()
  if (!ref) return

  window.localStorage.setItem(STORAGE_KEY, ref)

  const productMatch = pathname.match(/\/produto\/([^/?#]+)/)
  if (productMatch?.[1]) {
    window.localStorage.setItem(PRODUCT_STORAGE_KEY, productMatch[1])
  }
}

export function getStoredAffiliateRef() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export function getStoredAffiliateProductId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(PRODUCT_STORAGE_KEY)
}

export async function getAffiliateSaleFields(
  sellerId: string | null | undefined,
  amount: number,
  productId?: string | number | null,
  buyerId?: string | null,
): Promise<AffiliateSaleFields> {
  if (!sellerId || amount <= 0) return {}

  const ref = getStoredAffiliateRef()
  if (!ref) return {}

  if (buyerId && (buyerId === ref || buyerId.startsWith(ref))) {
    throw new Error('Voce nao pode comprar usando seu proprio link de afiliado.')
  }

  const { data, error } = await supabase
    .from('affiliates')
    .select('user_id, product_id, commission_percent, status')
    .eq('seller_id', sellerId)
    .eq('status', 'active')

  if (error) {
    console.warn('Nao foi possivel validar o afiliado da compra.', error)
    return {}
  }

  const storedProductId = getStoredAffiliateProductId()
  const saleProductId = productId == null ? null : String(productId)

  const affiliate = (data ?? []).find((item) => {
    const userId = String(item.user_id ?? '')
    const affiliateProductId = item.product_id == null ? null : String(item.product_id)
    const sameUser = userId === ref || userId.startsWith(ref)
    const sameProduct = !affiliateProductId || affiliateProductId === saleProductId || affiliateProductId === storedProductId
    return sameUser && sameProduct
  })

  if (!affiliate?.user_id) return {}

  const percent = Number(affiliate.commission_percent ?? 0)

  return {
    affiliate_user_id: String(affiliate.user_id),
    affiliate_commission_percent: percent,
    affiliate_commission_amount: Number(((amount * percent) / 100).toFixed(2)),
    affiliate_ref_product_id: affiliate.product_id == null ? undefined : Number(affiliate.product_id),
  }
}
