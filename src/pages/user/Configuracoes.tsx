import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AVATAR_BUCKET = 'profile_avatars'
const storeBioToolOptions = [
  { key: 'proxy', label: 'Proxy' },
  { key: 'smm', label: 'SMM' },
  { key: 'numeroVirtual', label: 'Numero virtual' },
  { key: 'emailTemporario', label: 'Email temporario' },
]

export function Configuracoes() {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [storeBio, setStoreBio] = useState('')
  const [storeBioTools, setStoreBioTools] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFullName(profile?.full_name ?? '')
      setPhone(profile?.phone ?? '')
      setAvatarUrl(profile?.avatar_url ?? '')
      setStoreSlug(profile?.store_slug ?? '')
      setStoreBio(profile?.store_bio ?? '')
      setStoreBioTools(profile?.store_bio_tools_json ?? {})
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [profile])

  const uploadAvatar = async (file: File | null) => {
    if (!file || !user) return
    setUploading(true)
    setError(null)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${extension}`
      const { data, error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })
      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(data.path)
      setAvatarUrl(publicData.publicUrl)
      await updateProfile({ avatar_url: publicData.publicUrl })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nao foi possivel enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Auto-generate slug if not provided but user is a seller
    let finalSlug = storeSlug
    if (profile?.role === 'seller' && !finalSlug && profile.store_name) {
      finalSlug = profile.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setStoreSlug(finalSlug)
    }

    try {
      await updateProfile({ 
        full_name: fullName, 
        phone, 
        avatar_url: avatarUrl || null,
        ...(profile?.role === 'seller' ? {
          store_slug: finalSlug || null,
          store_bio: storeBio || null,
          store_bio_tools_json: storeBioTools,
        } : {})
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    }
  }

  const content = (
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Configuracoes da Conta</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Dados Pessoais</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase text-gray-500">
                      {(fullName || user?.email || 'U').slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Foto de perfil</label>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    onChange={(event) => uploadAvatar(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-sm file:border-0 file:bg-ml-blue file:px-4 file:py-2 file:font-semibold file:text-white"
                    disabled={uploading}
                  />
                  <p className="mt-2 text-xs text-gray-400">{uploading ? 'Enviando foto...' : 'Essa imagem aparece no cabecalho da plataforma.'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Nome completo</label>
                <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">WhatsApp</label>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">E-mail</label>
                <input type="email" value={user?.email ?? ''} className="w-full h-12 px-4 border border-gray-300 rounded-sm bg-gray-50" disabled />
                <p className="text-xs text-gray-400 mt-2">O e-mail nao pode ser alterado por motivos de seguranca.</p>
              </div>

              {profile?.role === 'seller' && (
                <div className="space-y-5 rounded-md border border-ml-blue/20 bg-ml-blue/5 p-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ml-dark">Link bio da loja</label>
                    <div className="flex items-center">
                      <span className="flex h-12 items-center rounded-l-sm border border-r-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
                        cookiemarket.lat/loja/
                      </span>
                      <input
                        type="text"
                        value={storeSlug}
                        onChange={(event) => setStoreSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="minha-loja-oficial"
                        className="h-12 w-full rounded-r-sm border border-gray-300 px-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ml-blue"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Este sera o link publico da sua loja para Instagram, TikTok e bio.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ml-dark">Texto curto do link bio</label>
                    <textarea
                      value={storeBio}
                      onChange={(event) => setStoreBio(event.target.value)}
                      maxLength={180}
                      rows={3}
                      placeholder="Ex: Produtos digitais selecionados, suporte rapido e entrega segura."
                      className="w-full rounded-sm border border-gray-300 px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ml-blue"
                    />
                    <p className="mt-1 text-xs text-gray-400">{storeBio.length}/180</p>
                  </div>
                  <p className="rounded-sm border border-gray-200 bg-white p-3 text-xs text-gray-500">
                    As cores e aparencia do link bio sao controladas pelo admin em Personalizacao.
                  </p>
                  <div className="rounded-sm border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-ml-dark">Ferramentas no link bio</p>
                    <p className="mt-1 text-xs text-gray-500">Opcional. Ao ativar, elas aparecem discretamente abaixo da descricao da loja.</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {storeBioToolOptions.map((tool) => (
                        <label key={tool.key} className="flex items-center gap-2 rounded-sm border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(storeBioTools[tool.key])}
                            onChange={(event) => setStoreBioTools((current) => ({ ...current, [tool.key]: event.target.checked }))}
                            className="h-4 w-4 accent-ml-blue"
                          />
                          {tool.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">Salvar alteracoes</Button>
                {saved && <span className="text-sm text-green-600">Salvo.</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  )

  if (profile?.role === 'admin') return <AdminLayout>{content}</AdminLayout>
  if (profile?.role === 'seller') return <SellerLayout>{content}</SellerLayout>
  return <UserLayout>{content}</UserLayout>
}
