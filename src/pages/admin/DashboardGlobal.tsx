import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Activity, ExternalLink, MessageCircle, Shield, Star, Users } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { decodeHtmlEntities, formatCurrency } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { createWestPayGroupPromotionPixIn, validateWestPayCustomer } from '../../lib/westpay'

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

export function DashboardGlobal() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    monthlyVolume: 0,
    previousMonthlyVolume: 0,
    platformRevenue: 0,
    platformFee: 10,
    activeUsers: 0,
    newUsersToday: 0,
  })
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

  const name = profile?.full_name || 'Admin'
  const initial = name.charAt(0).toUpperCase()

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
      name: decodeHtmlEntities(String(item.name ?? '')),
      promotion_amount: item.promotion_amount == null ? null : Number(item.promotion_amount),
    })) as NetworkGroup[])
    setGroupPrice(Number(settings?.ads_group_daily_price ?? 10))
  }

  useEffect(() => {
    const loadStats = async () => {
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [salesResult, usersResult, todayUsersResult, settingsResult] = await Promise.all([
        supabase
          .from('sales')
          .select('amount,status,created_at')
          .eq('status', 'paid')
          .gte('created_at', previousMonthStart.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('platform_settings').select('platform_fee_percent').eq('id', 1).maybeSingle(),
      ])

      if (salesResult.error) throw salesResult.error
      if (usersResult.error) throw usersResult.error
      if (todayUsersResult.error) throw todayUsersResult.error
      if (settingsResult.error) throw settingsResult.error

      const platformFee = Number(settingsResult.data?.platform_fee_percent ?? 10)
      const currentSales = (salesResult.data ?? []).filter((sale) => new Date(sale.created_at) >= currentMonthStart)
      const previousSales = (salesResult.data ?? []).filter((sale) => {
        const createdAt = new Date(sale.created_at)
        return createdAt >= previousMonthStart && createdAt < currentMonthStart
      })
      const monthlyVolume = currentSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0)
      const previousMonthlyVolume = previousSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0)

      setStats({
        monthlyVolume,
        previousMonthlyVolume,
        platformRevenue: monthlyVolume * (platformFee / 100),
        platformFee,
        activeUsers: usersResult.count ?? 0,
        newUsersToday: todayUsersResult.count ?? 0,
      })
    }

    loadStats().catch(console.error)
  }, [])

  useEffect(() => {
    if (!user) return
    setGroupCustomerPhone(profile?.phone ?? '')
    loadGroups().catch(console.error)
  }, [user, profile?.phone])

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
      setGroupName(decodeHtmlEntities(metadata.name || 'Grupo do WhatsApp'))
      setGroupImageUrl(metadata.imageUrl || '')
    } catch {
      setGroupName('Grupo do WhatsApp')
    }
  }

  const handleCopyGroupPix = async (group: NetworkGroup) => {
    const value = group.payment_qrcode_text || group.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedGroupId(group.id)
    window.setTimeout(() => setCopiedGroupId(null), 2000)
  }

  const handleAddGroup = async () => {
    if (!user) return
    const link = normalizeGroupLink(groupLink)

    if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i.test(link)) {
      setGroupMessage('Informe um link valido de grupo do WhatsApp.')
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
      const nameToSave = decodeHtmlEntities(metadata.name || 'Grupo do WhatsApp')

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

  const monthlyChange = stats.previousMonthlyVolume > 0
    ? ((stats.monthlyVolume - stats.previousMonthlyVolume) / stats.previousMonthlyVolume) * 100
    : null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="overflow-hidden rounded-md border-none bg-white shadow-sm">
            <CardContent className="flex min-h-[320px] flex-col justify-center gap-8 p-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl font-light text-gray-400">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-light text-ml-dark">Ola, {name}</h1>
                  <p className="mt-1 text-gray-500">Conta admin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium text-gray-500">Volume Transacionado (Mes)</p>
                      <h3 className="truncate text-2xl font-light text-ml-dark">{formatCurrency(stats.monthlyVolume)}</h3>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${monthlyChange == null || monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {monthlyChange == null ? 'Sem base do mes anterior' : `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}% vs mes anterior`}
                  </p>
                </div>

                <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium text-gray-500">Receita da Plataforma (Taxas)</p>
                      <h3 className="truncate text-2xl font-light text-ml-dark">{formatCurrency(stats.platformRevenue)}</h3>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-ml-blue">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-400">Margem atual: {stats.platformFee}%</p>
                </div>

                <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium text-gray-500">Usuarios Ativos</p>
                      <h3 className="truncate text-2xl font-light text-ml-dark">{stats.activeUsers}</h3>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-400">{stats.newUsersToday} novos hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ml-dark">Meus grupos</h2>
                  <p className="text-sm text-gray-500">{groups.length} grupos cadastrados</p>
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
      </div>
    </AdminLayout>
  )
}
