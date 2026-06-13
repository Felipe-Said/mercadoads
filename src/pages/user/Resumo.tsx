import React, { useEffect, useState } from 'react'
import { Copy, Plus, Wallet, Banknote, CheckCircle2, MessageCircle, Star, ExternalLink } from 'lucide-react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/data'
import { createWestPayGroupPromotionPixIn, createWestPayWalletDepositPixIn, validateWestPayCustomer } from '../../lib/westpay'
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

type NetworkGroup = {
  id: number
  owner_id: string | null
  name: string
  members: number | null
  category: string
  link: string
  image_url: string | null
  sponsored: boolean
  is_active: boolean
  promotion_status: 'none' | 'pending' | 'paid' | 'cancelled'
  promotion_amount: number | null
  payment_qrcode?: string | null
  payment_qrcode_text?: string | null
  payment_qrcode_expires_at?: string | null
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
  const [groups, setGroups] = useState<NetworkGroup[]>([])
  const [groupPrice, setGroupPrice] = useState(10)
  const [groupLink, setGroupLink] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupImageUrl, setGroupImageUrl] = useState('')
  const [featureGroup, setFeatureGroup] = useState(false)
  const [groupCustomerPhone, setGroupCustomerPhone] = useState('')
  const [groupCustomerDocument, setGroupCustomerDocument] = useState('')
  const [groupMessage, setGroupMessage] = useState<string | null>(null)
  const [groupLoading, setGroupLoading] = useState(false)
  const [copiedGroupId, setCopiedGroupId] = useState<number | null>(null)

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

  const loadGroups = async () => {
    if (!user) return

    const [{ data: groupRows, error: groupsError }, { data: settings }] = await Promise.all([
      supabase
        .from('network_groups')
        .select('id, owner_id, name, members, category, link, image_url, sponsored, is_active, promotion_status, promotion_amount, payment_qrcode, payment_qrcode_text, payment_qrcode_expires_at, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('ads_group_daily_price').eq('id', 1).maybeSingle(),
    ])

    if (!groupsError) setGroups((groupRows ?? []).map((item) => ({
      ...item,
      promotion_amount: item.promotion_amount == null ? null : Number(item.promotion_amount),
    })) as NetworkGroup[])
    setGroupPrice(Number(settings?.ads_group_daily_price ?? 10))
  }

  useEffect(() => {
    if (!user) return
    setDepositName(profile?.full_name ?? '')
    setDepositPhone(profile?.phone ?? '')
    setDestinationName(profile?.full_name ?? '')
    setGroupCustomerPhone(profile?.phone ?? '')
    loadWallet().catch(console.error)
    loadGroups().catch(console.error)
  }, [user, profile?.full_name, profile?.phone])

  const handleCopyPix = async (deposit: WalletDeposit) => {
    const value = deposit.payment_qrcode_text || deposit.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedDepositId(deposit.id)
    window.setTimeout(() => setCopiedDepositId(null), 2000)
  }

  const handleCopyGroupPix = async (group: NetworkGroup) => {
    const value = group.payment_qrcode_text || group.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedGroupId(group.id)
    window.setTimeout(() => setCopiedGroupId(null), 2000)
  }

  const normalizeGroupLink = (value: string) => value.trim().replace(/[?#].*$/, '').replace(/\/+$/, '')

  const fetchGroupMetadata = async (link: string) => {
    const { data, error } = await supabase.functions.invoke('group_metadata', { body: { link } })
    if (error) throw error
    const payload = data as { success?: boolean; name?: string; imageUrl?: string | null; error?: string }
    if (payload.success === false) throw new Error(payload.error || 'Nao foi possivel ler o grupo.')
    return payload
  }

  const handleGroupLinkBlur = async () => {
    const link = normalizeGroupLink(groupLink)
    if (!link || groupName) return
    if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i.test(link)) return
    try {
      const metadata = await fetchGroupMetadata(link)
      setGroupName(metadata.name || 'Grupo do WhatsApp')
      setGroupImageUrl(metadata.imageUrl || '')
    } catch {
      setGroupName('Grupo do WhatsApp')
    }
  }

  const handleAddGroup = async () => {
    if (!user) return
    const link = normalizeGroupLink(groupLink)

    if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i.test(link)) {
      setGroupMessage('Informe um link valido de grupo do WhatsApp.')
      return
    }

    if (profile?.role === 'user' && groups.length >= 5) {
      setGroupMessage('Usuarios comuns podem cadastrar ate 5 grupos.')
      return
    }

    setGroupLoading(true)
    setGroupMessage(null)
    let groupId: number | null = null

    try {
      const duplicateResult = await supabase
        .from('network_groups')
        .select('id')
        .eq('link', link)
        .maybeSingle()

      if (duplicateResult.data) throw new Error('Esse grupo ja esta cadastrado.')

      const metadata = groupName ? { name: groupName, imageUrl: groupImageUrl || null } : await fetchGroupMetadata(link)
      const nameToSave = metadata.name || 'Grupo do WhatsApp'

      const { data: createdGroup, error } = await supabase
        .from('network_groups')
        .insert({
          owner_id: user.id,
          name: nameToSave,
          category: 'Comunidade',
          link,
          image_url: metadata.imageUrl || null,
          members: 0,
          sponsored: false,
          is_active: true,
          promotion_status: featureGroup ? 'pending' : 'none',
          promotion_amount: featureGroup ? groupPrice : null,
        })
        .select('id')
        .single()

      if (error) throw error
      groupId = Number(createdGroup.id)

      if (featureGroup) {
        const customer = validateWestPayCustomer({
          name,
          email: user.email ?? '',
          phone: groupCustomerPhone,
          documentNumber: groupCustomerDocument,
        })
        await createWestPayGroupPromotionPixIn({ groupId, amount: groupPrice, customer })
        setGroupMessage('Grupo cadastrado e Pix de destaque gerado.')
      } else {
        setGroupMessage('Grupo cadastrado.')
      }

      setGroupLink('')
      setGroupName('')
      setGroupImageUrl('')
      setFeatureGroup(false)
      setGroupCustomerDocument('')
      await loadGroups()
    } catch (error) {
      if (groupId) await supabase.from('network_groups').delete().eq('id', groupId)
      setGroupMessage(error instanceof Error ? error.message : 'Nao foi possivel cadastrar o grupo.')
    }

    setGroupLoading(false)
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="overflow-hidden rounded-md border-none bg-white shadow-sm">
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-3xl font-light text-gray-400">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
                </div>
                <div>
                  <h1 className="text-2xl font-light text-ml-dark">Ola, {name}</h1>
                  <p className="mt-1 text-gray-500">Conta {profile?.role ?? 'user'}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[500px]">
                <div className="rounded-sm border border-green-100 bg-green-50 p-3">
                  <p className="text-xs font-bold uppercase text-green-700">Para compras</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">{formatCurrency(balances.purchaseBalance)}</p>
                </div>
                <div className="rounded-sm border border-yellow-100 bg-yellow-50 p-3">
                  <p className="text-xs font-bold uppercase text-yellow-700">Para saque</p>
                  <p className="mt-1 text-2xl font-bold text-yellow-700">{formatCurrency(balances.withdrawBalance)}</p>
                </div>
                <div className="rounded-sm border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-bold uppercase text-blue-700">Pendente</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">{formatCurrency(balances.pendingDeposit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ml-dark">Meus grupos</h2>
                  <p className="text-sm text-gray-500">{profile?.role === 'user' ? `${groups.length}/5 grupos cadastrados` : `${groups.length} grupos cadastrados`}</p>
                </div>
                <MessageCircle className="h-5 w-5 text-[var(--layout-link-color)]" />
              </div>

              <div className="space-y-3">
                <input
                  value={groupLink}
                  onChange={(event) => setGroupLink(event.target.value)}
                  onBlur={handleGroupLinkBlur}
                  className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm"
                  placeholder="https://chat.whatsapp.com/..."
                />
                {groupName && (
                  <div className="flex items-center gap-3 rounded-sm border border-gray-100 bg-gray-50 p-2">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                      {groupImageUrl ? <img src={groupImageUrl} alt="" className="h-full w-full object-cover" /> : <MessageCircle className="h-5 w-5 text-gray-400" />}
                    </div>
                    <p className="min-w-0 truncate text-sm font-semibold text-gray-800">{groupName}</p>
                  </div>
                )}
                <label className="flex items-start gap-2 rounded-sm border border-gray-200 p-3 text-sm">
                  <input type="checkbox" checked={featureGroup} onChange={(event) => setFeatureGroup(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--layout-accent-color)]" />
                  <span>
                    <span className="block font-bold text-gray-800">Destacar grupo</span>
                    <span className="text-xs text-gray-500">Taxa: {formatCurrency(groupPrice)} por dia.</span>
                  </span>
                </label>
                {featureGroup && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={groupCustomerPhone} onChange={(event) => setGroupCustomerPhone(event.target.value)} className="h-10 rounded-sm border border-gray-300 px-3 text-sm" placeholder="WhatsApp com DDD" />
                    <input value={groupCustomerDocument} onChange={(event) => setGroupCustomerDocument(event.target.value)} className="h-10 rounded-sm border border-gray-300 px-3 text-sm" placeholder="CPF ou CNPJ" />
                  </div>
                )}
                {groupMessage && <p className={`text-sm ${groupMessage.includes('cadastrado') ? 'text-green-600' : 'text-red-600'}`}>{groupMessage}</p>}
                <Button onClick={handleAddGroup} disabled={groupLoading} className="layout-primary-button h-10 w-full rounded-sm font-bold">
                  {groupLoading ? 'Adicionando...' : 'Adicionar grupo'}
                </Button>
              </div>

              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                {groups.map((group) => (
                  <div key={group.id} className="rounded-sm border border-gray-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {group.image_url ? <img src={group.image_url} alt="" className="h-full w-full object-cover" /> : <MessageCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{group.name}</p>
                        <a href={group.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--layout-link-color)] hover:underline">
                          Abrir grupo <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {group.sponsored && <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />}
                    </div>
                    {group.promotion_status === 'pending' && (group.payment_qrcode_text || group.payment_qrcode) && (
                      <div className="mt-3 rounded-sm border border-yellow-200 bg-yellow-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-yellow-800">Pix do destaque pendente</p>
                          <button type="button" onClick={() => handleCopyGroupPix(group)} className="text-xs font-bold text-yellow-800 hover:underline">
                            {copiedGroupId === group.id ? 'Copiado' : 'Copiar Pix'}
                          </button>
                        </div>
                        <textarea readOnly value={group.payment_qrcode_text || group.payment_qrcode || ''} rows={3} className="w-full resize-none rounded-sm border border-yellow-200 bg-white p-2 font-mono text-[11px] text-gray-700" />
                      </div>
                    )}
                  </div>
                ))}
                {groups.length === 0 && <p className="rounded-sm border border-dashed border-gray-200 p-3 text-center text-sm text-gray-500">Nenhum grupo cadastrado.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

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
