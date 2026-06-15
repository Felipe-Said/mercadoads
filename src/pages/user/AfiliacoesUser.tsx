import React, { useEffect, useState, useCallback } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Copy, CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../lib/data'

type Affiliate = {
  id: string
  product_id?: number | null
  commission_percent: number
  status: string
  created_at: string
  seller?: { full_name: string | null } | null
  product?: { id: number | null; title: string | null } | null
}

type Withdrawal = {
  id: number
  amount: number
  pix_key: string
  destination_name?: string | null
  destination_document?: string | null
  status: string
  created_at: string
}

export function AfiliacoesUser() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'geral' | 'saques'>('geral')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  
  const [pixKey, setPixKey] = useState('')
  const [destinationName, setDestinationName] = useState('')
  const [destinationDocument, setDestinationDocument] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [acceptingAffiliateId, setAcceptingAffiliateId] = useState<string | null>(null)
  const [affiliateMessage, setAffiliateMessage] = useState<string | null>(null)
  const availableBalance = 0

  useEffect(() => {
    if (profile?.full_name && !destinationName) {
      setDestinationName(profile.full_name)
    }
  }, [destinationName, profile])

  const loadData = useCallback(async () => {
    if (!user) return

    // Load Affiliates
    const { data: affData, error: affError } = await supabase
      .from('affiliates')
      .select('id, product_id, commission_percent, status, created_at, seller:seller_id(full_name), product:product_id(id,title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!affError && affData) {
      setAffiliates(affData as Affiliate[])
    }

    // Load Withdrawals
    const { data: wData, error: wError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!wError && wData) {
      setWithdrawals(wData as Withdrawal[])
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const acceptAffiliate = async (affiliateId: string) => {
    setAffiliateMessage(null)
    setAcceptingAffiliateId(affiliateId)

    const { data, error } = await supabase.rpc('accept_affiliate_invite', {
      target_affiliate_id: affiliateId,
    })

    if (error || data !== true) {
      console.error(error ?? new Error('Convite de afiliado nao encontrado ou ja processado.'))
      setAffiliateMessage('Nao foi possivel aceitar o convite. Atualize e tente novamente.')
      setAcceptingAffiliateId(null)
      return
    }

    setAffiliateMessage('Convite aceito. Seu link foi liberado.')
    await loadData()
    setAcceptingAffiliateId(null)
  }

  const handleWithdrawRequest = async () => {
    if (!user) return
    if (!pixKey || !destinationName || !destinationDocument || !withdrawAmount) {
      setWithdrawMessage('Preencha todos os campos.')
      return
    }

    const amountNum = parseFloat(withdrawAmount.replace(',', '.'))
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawMessage('Valor inválido.')
      return
    }

    if (amountNum > availableBalance) {
      setWithdrawMessage('Saldo insuficiente.')
      return
    }

    setIsWithdrawing(true)
    setWithdrawMessage(null)

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount: amountNum,
        pix_key: pixKey,
        destination_name: destinationName,
        destination_document: destinationDocument,
        status: 'pending'
      })

    if (error) {
      setWithdrawMessage('Erro ao solicitar saque.')
    } else {
      setPixKey('')
      setDestinationName(profile?.full_name ?? '')
      setDestinationDocument('')
      setWithdrawAmount('')
      setWithdrawMessage('Saque solicitado com sucesso!')
      await loadData() // recarrega o histórico
    }
    
    setIsWithdrawing(false)
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Painel de Afiliado</h2>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'geral' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saques
          </button>
        </div>

        {/* TAB: VISÃO GERAL */}
        {activeTab === 'geral' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-medium text-ml-dark">Lojas Parceiras & Links</h3>
              </div>
              {affiliateMessage && (
                <div className={`border-b border-gray-100 px-6 py-3 text-sm font-semibold ${affiliateMessage.includes('aceito') ? 'text-green-600' : 'text-red-600'}`}>
                  {affiliateMessage}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Vendedor</th>
                      <th className="px-6 py-4 font-medium">Comissão</th>
                      <th className="px-6 py-4 font-medium">Link Único de Divulgação</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliates.map((affiliate) => {
                      const publicBaseUrl = 'https://cookiemarket.lat'
                      const productId = affiliate.product?.id ?? affiliate.product_id
                      const fallbackStore = affiliate.seller?.full_name?.replace(/\s+/g, '').toLowerCase() || 'loja'
                      const linkStr = productId
                        ? `${publicBaseUrl}/produto/${productId}?ref=${user?.id ?? ''}`
                        : `${publicBaseUrl}/loja/${fallbackStore}?ref=${user?.id ?? ''}`
                      const isPending = affiliate.status === 'pending'
                      return (
                        <tr key={affiliate.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-ml-dark">{affiliate.seller?.full_name ?? 'Vendedor'}</p>
                            <p className="text-xs text-gray-500">{affiliate.product?.title ?? 'Programa da loja'} · {affiliate.status}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-sm text-xs font-semibold">{affiliate.commission_percent}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm break-all">
                              {isPending ? 'Aceite o convite nas notificacoes para liberar o link.' : linkStr}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => acceptAffiliate(affiliate.id)}
                                disabled={acceptingAffiliateId === affiliate.id}
                                className="rounded-sm bg-[var(--layout-button-primary-bg)] px-3 py-2 text-xs font-bold text-[var(--layout-button-primary-text)] disabled:cursor-wait disabled:opacity-70"
                              >
                                {acceptingAffiliateId === affiliate.id ? 'Aceitando...' : 'Aceitar convite'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopy(linkStr)}
                                className="p-2 text-gray-400 hover:text-ml-blue hover:bg-blue-50 rounded-full transition-colors"
                                title="Copiar Link"
                              >
                                {copiedLink === linkStr ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {affiliates.length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma afiliação encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB: SAQUES */}
        {activeTab === 'saques' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Withdrawal Box */}
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-8">
                  <h3 className="text-xl font-light text-ml-dark mb-6">Solicitar Saque</h3>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                    <p className="text-sm text-blue-600 font-medium mb-1">Saldo Disponivel</p>
                    <p className="text-3xl font-bold text-ml-blue">{formatCurrency(availableBalance)}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do destinatario</label>
                      <input 
                        type="text" 
                        value={destinationName}
                        onChange={(e) => setDestinationName(e.target.value)}
                        placeholder="Nome completo do titular" 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Documento do destinatario</label>
                      <input 
                        type="text" 
                        value={destinationDocument}
                        onChange={(e) => setDestinationDocument(e.target.value)}
                        placeholder="CPF ou CNPJ" 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX (Destino)</label>
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, E-mail ou Telefone..." 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Saque (R$)</label>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0,00" 
                        className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-lg font-medium"
                      />
                    </div>
                    
                    {withdrawMessage && (
                      <p className={`text-sm ${withdrawMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                        {withdrawMessage}
                      </p>
                    )}

                    <Button 
                      onClick={handleWithdrawRequest}
                      disabled={isWithdrawing}
                      className="w-full bg-ml-blue hover:bg-ml-hover text-white font-semibold h-12 rounded-sm shadow-sm transition-colors mt-2"
                    >
                      {isWithdrawing ? 'Processando...' : 'Confirmar Saque'}
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-2">A transferência via Gateway pode levar até 2h para ser processada.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal History */}
              <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-ml-dark">Histórico de Saques</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Data</th>
                        <th className="px-6 py-4 font-medium">Valor</th>
                        <th className="px-6 py-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(w.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-medium text-ml-dark">
                            R$ {w.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {w.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-sm text-xs font-semibold">
                                <Clock className="w-3 h-3" /> Pendente
                              </span>
                            )}
                            {w.status === 'paid' && (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-sm text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Pago
                              </span>
                            )}
                            {w.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-sm text-xs font-semibold">
                                Rejeitado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && (
                        <tr>
                          <td className="px-6 py-8 text-center text-gray-500" colSpan={3}>Nenhum saque solicitado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  )
}
