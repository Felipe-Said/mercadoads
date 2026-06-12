import React, { useEffect, useState } from 'react'
import { Copy, Plus, Wallet, Banknote, CheckCircle2 } from 'lucide-react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/data'
import { createWestPayWalletDepositPixIn, validateWestPayCustomer } from '../../lib/westpay'
import { PixQrCode } from '../../components/PixQrCode'
import { getWalletBalances, type WalletBalances } from '../../lib/wallet'

type WalletDeposit = {
  id: number
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  payment_qrcode?: string | null
  payment_qrcode_text?: string | null
  payment_qrcode_expires_at?: string | null
  paid_at?: string | null
  available_at?: string | null
  created_at: string
}

type WalletWithdrawal = {
  id: number
  amount: number
  gross_amount: number | null
  fee_amount: number | null
  status: string
  created_at: string
}

export function Resumo() {
  const { user, profile } = useAuth()
  const [deposits, setDeposits] = useState<WalletDeposit[]>([])
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawal[]>([])
  const [balances, setBalances] = useState<WalletBalances>({ purchaseBalance: 0, withdrawBalance: 0, lockedForWithdrawal: 0, pendingDeposit: 0 })
  const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(5)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositName, setDepositName] = useState('')
  const [depositPhone, setDepositPhone] = useState('')
  const [depositDocument, setDepositDocument] = useState('')
  const [depositMessage, setDepositMessage] = useState<string | null>(null)
  const [depositLoading, setDepositLoading] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [destinationName, setDestinationName] = useState('')
  const [destinationDocument, setDestinationDocument] = useState('')
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [copiedDepositId, setCopiedDepositId] = useState<number | null>(null)

  const name = profile?.full_name || 'Usuario'
  const initial = name.charAt(0).toUpperCase()

  const loadWallet = async () => {
    if (!user) return

    const [depositsResult, withdrawalsResult, settingsResult] = await Promise.all([
      supabase.from('wallet_deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('id, amount, gross_amount, fee_amount, status, created_at').eq('user_id', user.id).eq('source', 'wallet').order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('wallet_withdrawal_fee_percent').eq('id', 1).maybeSingle(),
    ])

    if (!depositsResult.error) setDeposits((depositsResult.data ?? []).map((item) => ({ ...item, amount: Number(item.amount ?? 0) })) as WalletDeposit[])
    if (!withdrawalsResult.error) {
      setWithdrawals((withdrawalsResult.data ?? []).map((item) => ({
        ...item,
        amount: Number(item.amount ?? 0),
        gross_amount: item.gross_amount == null ? null : Number(item.gross_amount),
        fee_amount: item.fee_amount == null ? null : Number(item.fee_amount),
      })) as WalletWithdrawal[])
    }
    if (!settingsResult.error) setWithdrawalFeePercent(Number(settingsResult.data?.wallet_withdrawal_fee_percent ?? 5))
    setBalances(await getWalletBalances(user.id))
  }

  useEffect(() => {
    if (!user) return
    setDepositName(profile?.full_name ?? '')
    setDepositPhone(profile?.phone ?? '')
    setDestinationName(profile?.full_name ?? '')
    loadWallet().catch(console.error)
  }, [user, profile?.full_name, profile?.phone])

  const handleCopyPix = async (deposit: WalletDeposit) => {
    const value = deposit.payment_qrcode_text || deposit.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedDepositId(deposit.id)
    window.setTimeout(() => setCopiedDepositId(null), 2000)
  }

  const handleAddFunds = async () => {
    if (!user) return
    const amount = Number(depositAmount.replace(',', '.'))
    if (!amount || amount <= 0) {
      setDepositMessage('Informe um valor valido.')
      return
    }

    setDepositLoading(true)
    setDepositMessage(null)

    let depositId: number | null = null
    try {
      const customer = validateWestPayCustomer({
        name: depositName,
        email: user.email ?? '',
        phone: depositPhone,
        documentNumber: depositDocument,
      })

      const { data: deposit, error } = await supabase
        .from('wallet_deposits')
        .insert({ user_id: user.id, amount, status: 'pending' })
        .select('id')
        .single()

      if (error) throw error
      depositId = Number(deposit.id)

      await createWestPayWalletDepositPixIn({ depositId: String(depositId), amount, customer })
      setDepositAmount('')
      setDepositMessage('Pix gerado para adicionar fundos.')
      await loadWallet()
    } catch (error) {
      if (depositId) await supabase.from('wallet_deposits').update({ status: 'cancelled' }).eq('id', depositId)
      setDepositMessage(error instanceof Error ? error.message : 'Nao foi possivel adicionar fundos.')
    }

    setDepositLoading(false)
  }

  const handleWithdraw = async () => {
    if (!user) return
    const grossAmount = Number(withdrawAmount.replace(',', '.'))
    if (!grossAmount || grossAmount <= 0 || !pixKey || !destinationName || !destinationDocument) {
      setWithdrawMessage('Preencha todos os campos.')
      return
    }

    if (grossAmount > balances.withdrawBalance) {
      setWithdrawMessage('Saldo insuficiente.')
      return
    }

    const feeAmount = Number((grossAmount * withdrawalFeePercent / 100).toFixed(2))
    const netAmount = Math.max(grossAmount - feeAmount, 0)

    setWithdrawLoading(true)
    setWithdrawMessage(null)

    const { error } = await supabase.from('withdrawals').insert({
      user_id: user.id,
      source: 'wallet',
      gross_amount: grossAmount,
      fee_amount: feeAmount,
      amount: netAmount,
      pix_key: pixKey,
      destination_name: destinationName,
      destination_document: destinationDocument,
      status: 'pending',
    })

    if (error) {
      setWithdrawMessage(error.message)
    } else {
      setWithdrawAmount('')
      setPixKey('')
      setDestinationDocument('')
      setWithdrawMessage('Saque solicitado.')
      await loadWallet()
    }

    setWithdrawLoading(false)
  }

  const latestPendingDeposit = deposits.find((deposit) => deposit.status === 'pending' && (deposit.payment_qrcode_text || deposit.payment_qrcode))

  return (
    <UserLayout>
      <div className="space-y-6">
        <Card className="overflow-hidden rounded-md border-none bg-white shadow-sm">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-3xl font-light text-gray-400">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
              </div>
              <div>
                <h1 className="text-2xl font-light text-ml-dark">Ola, {name}</h1>
                <p className="mt-1 text-gray-500">Conta {profile?.role ?? 'user'}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-sm border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-bold uppercase text-green-700">Para compras</p>
                <p className="mt-1 text-2xl font-bold text-green-700">{formatCurrency(balances.purchaseBalance)}</p>
              </div>
              <div className="rounded-sm border border-yellow-100 bg-yellow-50 p-4">
                <p className="text-xs font-bold uppercase text-yellow-700">Para saque</p>
                <p className="mt-1 text-2xl font-bold text-yellow-700">{formatCurrency(balances.withdrawBalance)}</p>
              </div>
              <div className="rounded-sm border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-blue-700">Pendente</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">{formatCurrency(balances.pendingDeposit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--layout-subtle-background)] text-[var(--layout-link-color)]">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ml-dark">Adicionar fundos</h2>
                  <p className="text-sm text-gray-500">Gere um Pix para carregar sua carteira.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} className="h-11 rounded-sm border border-gray-300 px-3 text-sm" placeholder="Valor em R$" />
                <input value={depositName} onChange={(event) => setDepositName(event.target.value)} className="h-11 rounded-sm border border-gray-300 px-3 text-sm" placeholder="Nome completo" />
                <input value={depositPhone} onChange={(event) => setDepositPhone(event.target.value)} className="h-11 rounded-sm border border-gray-300 px-3 text-sm" placeholder="WhatsApp com DDD" />
                <input value={depositDocument} onChange={(event) => setDepositDocument(event.target.value)} className="h-11 rounded-sm border border-gray-300 px-3 text-sm" placeholder="CPF ou CNPJ" />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {depositMessage && <p className={`text-sm ${depositMessage.includes('gerado') ? 'text-green-600' : 'text-red-600'}`}>{depositMessage}</p>}
                <Button onClick={handleAddFunds} disabled={depositLoading} className="layout-primary-button h-11 rounded-sm px-6 font-bold">
                  {depositLoading ? 'Gerando...' : 'Gerar Pix'}
                </Button>
              </div>

              {latestPendingDeposit && (
                <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-[176px_minmax(0,1fr)]">
                    <PixQrCode value={(latestPendingDeposit.payment_qrcode_text || latestPendingDeposit.payment_qrcode) as string} />
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-yellow-800">Pix aguardando pagamento</p>
                        <Button type="button" onClick={() => handleCopyPix(latestPendingDeposit)} className="h-9 rounded-sm border border-yellow-300 bg-white px-3 text-xs font-semibold text-yellow-800 hover:bg-yellow-100">
                          {copiedDepositId === latestPendingDeposit.id ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                          {copiedDepositId === latestPendingDeposit.id ? 'Copiado' : 'Copiar Pix'}
                        </Button>
                      </div>
                      <textarea readOnly value={latestPendingDeposit.payment_qrcode_text || latestPendingDeposit.payment_qrcode || ''} rows={5} className="w-full resize-none rounded-sm border border-yellow-200 bg-white p-3 font-mono text-xs text-gray-700" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--layout-subtle-background)] text-[var(--layout-link-color)]">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ml-dark">Solicitar saque</h2>
                  <p className="text-sm text-gray-500">Valor disponivel: {formatCurrency(balances.withdrawBalance)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Valor em R$" />
                <input value={destinationName} onChange={(event) => setDestinationName(event.target.value)} className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Nome do destinatario" />
                <input value={destinationDocument} onChange={(event) => setDestinationDocument(event.target.value)} className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="CPF ou CNPJ do destinatario" />
                <input value={pixKey} onChange={(event) => setPixKey(event.target.value)} className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Chave Pix" />
                {withdrawAmount && (
                  <div className="rounded-sm bg-gray-50 p-3 text-xs text-gray-600">
                    <p>Valor solicitado: <strong>{formatCurrency(Number(withdrawAmount.replace(',', '.')) || 0)}</strong></p>
                    <p>Valor liquido estimado: <strong>{formatCurrency(Math.max((Number(withdrawAmount.replace(',', '.')) || 0) * (1 - withdrawalFeePercent / 100), 0))}</strong></p>
                  </div>
                )}
                {withdrawMessage && <p className={`text-sm ${withdrawMessage.includes('solicitado') ? 'text-green-600' : 'text-red-600'}`}>{withdrawMessage}</p>}
                <Button onClick={handleWithdraw} disabled={withdrawLoading} className="h-11 w-full rounded-sm bg-ml-blue font-bold text-white hover:bg-ml-hover">
                  {withdrawLoading ? 'Solicitando...' : 'Solicitar saque'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-md border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-[var(--layout-link-color)]" />
              <h2 className="text-lg font-bold text-ml-dark">Historico da carteira</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...deposits.map((item) => ({ kind: 'Deposito', date: item.created_at, status: item.status, amount: item.amount })), ...withdrawals.map((item) => ({ kind: 'Saque', date: item.created_at, status: item.status, amount: Number(item.gross_amount ?? item.amount) }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map((item, index) => (
                    <tr key={`${item.kind}-${item.date}-${index}`}>
                      <td className="px-4 py-3 font-medium text-ml-dark">{item.kind}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-gray-500">{item.status}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  {deposits.length === 0 && withdrawals.length === 0 && (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={4}>Nenhuma movimentacao encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}
