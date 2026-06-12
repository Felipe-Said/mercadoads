import { supabase } from './supabase'

export type WalletBalances = {
  purchaseBalance: number
  withdrawBalance: number
  lockedForWithdrawal: number
  pendingDeposit: number
}

export async function getWalletBalances(userId: string): Promise<WalletBalances> {
  const [depositsResult, withdrawalsResult, spendsResult] = await Promise.all([
    supabase.from('wallet_deposits').select('amount, status, available_at').eq('user_id', userId),
    supabase.from('withdrawals').select('amount, gross_amount, status').eq('user_id', userId).eq('source', 'wallet'),
    supabase.from('wallet_spends').select('amount').eq('user_id', userId),
  ])

  if (depositsResult.error) throw depositsResult.error
  if (withdrawalsResult.error) throw withdrawalsResult.error
  if (spendsResult.error) throw spendsResult.error

  const now = Date.now()
  const paidDeposits = depositsResult.data?.filter((deposit) => deposit.status === 'paid') ?? []
  const purchaseDeposits = paidDeposits.reduce((sum, deposit) => sum + Number(deposit.amount ?? 0), 0)
  const withdrawDeposits = paidDeposits
    .filter((deposit) => deposit.available_at && new Date(deposit.available_at).getTime() <= now)
    .reduce((sum, deposit) => sum + Number(deposit.amount ?? 0), 0)
  const pendingDeposit = depositsResult.data
    ?.filter((deposit) => deposit.status === 'pending')
    .reduce((sum, deposit) => sum + Number(deposit.amount ?? 0), 0) ?? 0
  const spent = spendsResult.data?.reduce((sum, spend) => sum + Number(spend.amount ?? 0), 0) ?? 0
  const withdrawn = withdrawalsResult.data
    ?.filter((withdrawal) => ['pending', 'paid'].includes(String(withdrawal.status)))
    .reduce((sum, withdrawal) => sum + Number(withdrawal.gross_amount ?? withdrawal.amount ?? 0), 0) ?? 0
  const purchaseBalance = Math.max(purchaseDeposits - spent - withdrawn, 0)
  const withdrawBalance = Math.max(withdrawDeposits - spent - withdrawn, 0)

  return {
    purchaseBalance,
    withdrawBalance,
    lockedForWithdrawal: Math.max(purchaseBalance - withdrawBalance, 0),
    pendingDeposit,
  }
}
