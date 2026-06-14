import { supabase } from './supabase'

const STORAGE_KEY = 'cookie-market-affiliate-ref'

type AffiliateSaleFields = {
  affiliate_user_id?: string
  affiliate_commission_percent?: number
  affiliate_commission_amount?: number
}

export function storeAffiliateRefFromSearch(search: string) {
  if (typeof window === 'undefined') return

  const ref = new URLSearchParams(search).get('ref')?.trim()
  if (!ref) return

  window.localStorage.setItem(STORAGE_KEY, ref)
}

export function getStoredAffiliateRef() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export async function getAffiliateSaleFields(sellerId: string | null | undefined, amount: number): Promise<AffiliateSaleFields> {
  if (!sellerId || amount <= 0) return {}

  const ref = getStoredAffiliateRef()
  if (!ref) return {}

  const { data, error } = await supabase
    .from('affiliates')
    .select('user_id, commission_percent, status')
    .eq('seller_id', sellerId)
    .eq('status', 'active')

  if (error) {
    console.warn('Nao foi possivel validar o afiliado da compra.', error)
    return {}
  }

  const affiliate = (data ?? []).find((item) => {
    const userId = String(item.user_id ?? '')
    return userId === ref || userId.startsWith(ref)
  })

  if (!affiliate?.user_id) return {}

  const percent = Number(affiliate.commission_percent ?? 0)

  return {
    affiliate_user_id: String(affiliate.user_id),
    affiliate_commission_percent: percent,
    affiliate_commission_amount: Number(((amount * percent) / 100).toFixed(2)),
  }
}
