import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AVATAR_BUCKET = 'profile_avatars'

export function Configuracoes() {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFullName(profile?.full_name ?? '')
      setPhone(profile?.phone ?? '')
      setAvatarUrl(profile?.avatar_url ?? '')
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
    await updateProfile({ full_name: fullName, phone, avatar_url: avatarUrl || null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                    accept="image/*"
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
