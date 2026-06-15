import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

type Tab = 'taxas' | 'oficiais' | 'ferramentas'
type ToolKey = 'proxy' | 'smm' | 'numeroVirtual' | 'emailTemporario'
type ToolCommissionSettings = Record<ToolKey, { seller: number; affiliate: number }>

const DEFAULT_TOOL_COMMISSIONS: ToolCommissionSettings = {
  proxy: { seller: 5, affiliate: 5 },
  smm: { seller: 5, affiliate: 5 },
  numeroVirtual: { seller: 5, affiliate: 5 },
  emailTemporario: { seller: 5, affiliate: 5 },
}

const toolLabels: Array<{ key: ToolKey; name: string; description: string }> = [
  { key: 'proxy', name: 'Proxy', description: 'Comissao aplicada nas vendas de proxies.' },
  { key: 'smm', name: 'SMM', description: 'Comissao aplicada nas vendas de servicos SMM.' },
  { key: 'numeroVirtual', name: 'Numero virtual', description: 'Comissao aplicada nas vendas de numeros virtuais.' },
  { key: 'emailTemporario', name: 'Email temporario', description: 'Comissao aplicada nas vendas de emails temporarios.' },
]

function numberFrom(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeToolCommissions(value: unknown): ToolCommissionSettings {
  const source = (value && typeof value === 'object' ? value : {}) as Record<string, { seller?: unknown; affiliate?: unknown }>
  return toolLabels.reduce((acc, tool) => {
    acc[tool.key] = {
      seller: numberFrom(source[tool.key]?.seller, DEFAULT_TOOL_COMMISSIONS[tool.key].seller),
      affiliate: numberFrom(source[tool.key]?.affiliate, DEFAULT_TOOL_COMMISSIONS[tool.key].affiliate),
    }
    return acc
  }, {} as ToolCommissionSettings)
}

function PercentInput({
  label,
  value,
  onChange,
  help,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  help?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(numberFrom(event.target.value))}
          className="h-12 w-full rounded-sm border border-gray-300 px-4 pr-10 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ml-blue"
        />
        <span className="absolute right-4 top-3 text-gray-400">%</span>
      </div>
      {help && <p className="mt-2 text-xs text-gray-400">{help}</p>}
    </div>
  )
}

export function Taxas() {
  const [activeTab, setActiveTab] = useState<Tab>('taxas')
  const [platformFee, setPlatformFee] = useState(0)
  const [withdrawalFee, setWithdrawalFee] = useState(0)
  const [officialProductCommission, setOfficialProductCommission] = useState(0)
  const [toolCommissions, setToolCommissions] = useState<ToolCommissionSettings>(DEFAULT_TOOL_COMMISSIONS)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('platform_fee_percent, wallet_withdrawal_fee_percent, official_product_commission_percent, tool_commissions_json, affiliate_fee_percent')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError || !data) return
        setPlatformFee(numberFrom(data.platform_fee_percent))
        setWithdrawalFee(numberFrom(data.wallet_withdrawal_fee_percent, 5))
        setOfficialProductCommission(numberFrom(data.official_product_commission_percent, numberFrom(data.affiliate_fee_percent, 5)))
        setToolCommissions(normalizeToolCommissions(data.tool_commissions_json))
      })
      .catch(console.error)
  }, [])

  const updateToolCommission = (tool: ToolKey, field: 'seller' | 'affiliate', value: number) => {
    setToolCommissions((current) => ({
      ...current,
      [tool]: {
        ...current[tool],
        [field]: value,
      },
    }))
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const { error: saveError } = await supabase
      .from('platform_settings')
      .update({
        platform_fee_percent: platformFee,
        wallet_withdrawal_fee_percent: withdrawalFee,
        affiliate_fee_percent: officialProductCommission,
        official_product_commission_percent: officialProductCommission,
        tool_commissions_json: toolCommissions,
      })
      .eq('id', 1)

    if (saveError) {
      setError(saveError.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <form className="space-y-6" onSubmit={save}>
        <div>
          <h2 className="text-xl font-light text-ml-dark">Taxas e Configuracoes da Plataforma</h2>
          <p className="mt-1 text-sm text-gray-500">Controle as taxas de transacao, saque e as comissoes pagas por produtos e ferramentas.</p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-white p-2 shadow-sm">
          {[
            { key: 'taxas' as const, label: 'Taxas' },
            { key: 'oficiais' as const, label: 'Comissao produtos oficiais' },
            { key: 'ferramentas' as const, label: 'Ferramentas' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-sm px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'bg-ml-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-ml-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'taxas' && (
          <Card className="max-w-3xl overflow-hidden rounded-md border-none bg-white shadow-sm">
            <CardContent className="space-y-6 p-8">
              <div>
                <h3 className="text-lg font-semibold text-ml-dark">Taxas</h3>
                <p className="mt-1 text-sm text-gray-500">Valores cobrados pela plataforma em vendas e retiradas.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <PercentInput
                  label="Taxa de transacao de venda"
                  value={platformFee}
                  onChange={setPlatformFee}
                  help="Percentual retido em cada venda de produto."
                />
                <PercentInput
                  label="Taxa de saque"
                  value={withdrawalFee}
                  onChange={setWithdrawalFee}
                  help="Percentual cobrado quando o usuario solicita retirada de saldo."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'oficiais' && (
          <Card className="max-w-3xl overflow-hidden rounded-md border-none bg-white shadow-sm">
            <CardContent className="space-y-6 p-8">
              <div>
                <h3 className="text-lg font-semibold text-ml-dark">Comissao produtos oficiais</h3>
                <p className="mt-1 text-sm text-gray-500">Percentual global usado nas contas de anuncios e arquivos vendidos pelo perfil oficial.</p>
              </div>
              <PercentInput
                label="Comissao global dos produtos oficiais"
                value={officialProductCommission}
                onChange={setOfficialProductCommission}
                help="Este valor tambem atualiza a comissao global padrao de afiliados para manter compatibilidade com o fluxo atual."
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'ferramentas' && (
          <Card className="overflow-hidden rounded-md border-none bg-white shadow-sm">
            <CardContent className="space-y-6 p-8">
              <div>
                <h3 className="text-lg font-semibold text-ml-dark">Ferramentas</h3>
                <p className="mt-1 text-sm text-gray-500">Configure a comissao de cada ferramenta conforme o tipo de conta que indicou o cliente.</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {toolLabels.map((tool) => (
                  <div key={tool.key} className="rounded-md border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-ml-dark">{tool.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">{tool.description}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <PercentInput
                        label="Vendedor"
                        value={toolCommissions[tool.key].seller}
                        onChange={(value) => updateToolCommission(tool.key, 'seller', value)}
                      />
                      <PercentInput
                        label="Afiliado"
                        value={toolCommissions[tool.key].affiliate}
                        onChange={(value) => updateToolCommission(tool.key, 'affiliate', value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-4">
          <Button type="submit" className="rounded-sm bg-ml-blue px-6 py-3 font-semibold text-white shadow-sm hover:bg-ml-hover">
            Salvar alteracoes
          </Button>
          {saved && <span className="text-sm font-medium text-green-600">Configuracoes salvas com sucesso!</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </AdminLayout>
  )
}
