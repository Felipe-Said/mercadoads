import React, { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Image as ImageIcon, Pencil, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { type BannerPosition } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { applyPlatformTheme } from '../../lib/theme'

type BannerForm = {
  title: string
  subtitle: string
  image_url: string
  mobile_image_url: string
  link_url: string
  background_color: string
  position: BannerPosition
  sort_order: number
  is_active: boolean
}

type BannerRecord = BannerForm & {
  id: string
  created_at?: string
}

type HeaderPromoState = {
  enabled: boolean
  gifUrl: string
  text: string
  link: string
  backgroundColor: string
  textColor: string
}

const ASSET_BUCKET = 'platform_assets'

const emptyBannerForm: BannerForm = {
  title: '',
  subtitle: '',
  image_url: '',
  mobile_image_url: '',
  link_url: '/',
  background_color: '#232f3e',
  position: 'home_hero',
  sort_order: 0,
  is_active: true,
}

const bannerPositionOptions: { value: BannerPosition; label: string; helper: string; group: string }[] = [
  { value: 'home_hero', label: 'Home | Banner principal', helper: 'Carrossel grande no topo da home.', group: 'Topo da home' },
  { value: 'home_side_top', label: 'Home | Lateral superior', helper: 'Primeiro card lateral direito.', group: 'Laterais da home' },
  { value: 'home_side_middle', label: 'Home | Lateral central', helper: 'Segundo card lateral direito.', group: 'Laterais da home' },
  { value: 'home_side_bottom', label: 'Home | Lateral inferior', helper: 'Terceiro card lateral direito.', group: 'Laterais da home' },
  { value: 'home_deals_top', label: 'Home | Faixa de ofertas esquerda', helper: 'Banner medio na area de ofertas.', group: 'Ofertas e chamadas' },
  { value: 'home_deals_bottom', label: 'Home | Faixa de ofertas direita', helper: 'Banner medio ao lado da faixa de ofertas.', group: 'Ofertas e chamadas' },
  { value: 'home_grid_1', label: 'Home | Grade 1', helper: 'Primeiro card da grade de banners.', group: 'Grade de banners' },
  { value: 'home_grid_2', label: 'Home | Grade 2', helper: 'Segundo card da grade de banners.', group: 'Grade de banners' },
  { value: 'home_grid_3', label: 'Home | Grade 3', helper: 'Terceiro card da grade de banners.', group: 'Grade de banners' },
  { value: 'home_grid_4', label: 'Home | Grade 4', helper: 'Quarto card da grade de banners.', group: 'Grade de banners' },
  { value: 'home_middle', label: 'Home | Banner horizontal central', helper: 'Faixa larga no meio da home.', group: 'Banners horizontais' },
  { value: 'home_bottom', label: 'Home | Banner inferior', helper: 'Faixa larga perto do fim da home.', group: 'Banners horizontais' },
  { value: 'left_flyer', label: 'Flyer lateral esquerdo', helper: 'Compatibilidade com banners laterais antigos.', group: 'Legado' },
  { value: 'right_flyer', label: 'Flyer lateral direito', helper: 'Compatibilidade com banners laterais antigos.', group: 'Legado' },
]

const sectionLinks = [
  { id: 'marca', label: 'Marca' },
  { id: 'cabecalho', label: 'Cabecalho' },
  { id: 'cores', label: 'Cores globais' },
  { id: 'aba', label: 'Aba do navegador' },
  { id: 'banners', label: 'Banners' },
]

function getBannerPositionLabel(position: BannerPosition | string) {
  return bannerPositionOptions.find((option) => option.value === position)?.label ?? position
}

function mapBanner(row: Record<string, unknown>): BannerRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: row.subtitle ? String(row.subtitle) : '',
    image_url: row.image_url ? String(row.image_url) : '',
    mobile_image_url: row.mobile_image_url ? String(row.mobile_image_url) : '',
    link_url: String(row.link_url ?? '/'),
    background_color: String(row.background_color ?? '#232f3e'),
    position: (row.position as BannerPosition) ?? 'home_hero',
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active ?? true),
    created_at: row.created_at ? String(row.created_at) : undefined,
  }
}

export function Personalizacao() {
  const [primaryColor, setPrimaryColor] = useState('#fff159')
  const [secondaryColor, setSecondaryColor] = useState('#3483fa')
  const [browserTitle, setBrowserTitle] = useState('Cookie market')
  const [browserTitleInactive, setBrowserTitleInactive] = useState('Cookie market')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [desktopLogoSize, setDesktopLogoSize] = useState(130)
  const [mobileLogoSize, setMobileLogoSize] = useState(80)
  const [headerTopbarBg, setHeaderTopbarBg] = useState('#fff3c4')
  const [headerTopbarText, setHeaderTopbarText] = useState('#1f2937')
  const [headerNavBg, setHeaderNavBg] = useState('#ffe600')
  const [headerNavText, setHeaderNavText] = useState('#333333')
  const [headerPromo, setHeaderPromo] = useState<HeaderPromoState>({
    enabled: true,
    gifUrl: '',
    text: '',
    link: '',
    backgroundColor: '#fff3c4',
    textColor: '#1f2937',
  })
  const [banners, setBanners] = useState<BannerRecord[]>([])
  const [bannerForm, setBannerForm] = useState<BannerForm>(emptyBannerForm)
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [bannerLoading, setBannerLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const activeBannerCount = banners.filter((banner) => banner.is_active).length
  const inactiveBannerCount = banners.length - activeBannerCount

  const groupedBannerOptions = useMemo(() => {
    const groups = new Map<string, typeof bannerPositionOptions>()
    bannerPositionOptions.forEach((option) => {
      groups.set(option.group, [...(groups.get(option.group) ?? []), option])
    })
    return Array.from(groups.entries())
  }, [])

  useEffect(() => {
    loadSettings().catch(console.error)
    loadBanners().catch(console.error)
  }, [])

  const loadSettings = async () => {
    const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle()
    if (error) throw error

    setPrimaryColor(data?.primary_color ?? '#fff159')
    setSecondaryColor(data?.secondary_color ?? '#3483fa')
    setBrowserTitle(data?.browser_title ?? 'Cookie market')
    setBrowserTitleInactive(data?.browser_title_inactive ?? data?.browser_title ?? 'Cookie market')
    setLogoUrl(data?.logo_url ?? '')
    setFaviconUrl(data?.favicon_url ?? '')
    setDesktopLogoSize(Number(data?.logo_desktop_size ?? 130))
    setMobileLogoSize(Number(data?.logo_mobile_size ?? 80))
    setHeaderTopbarBg(data?.header_topbar_bg_color ?? '#fff3c4')
    setHeaderTopbarText(data?.header_topbar_text_color ?? '#1f2937')
    setHeaderNavBg(data?.header_nav_bg_color ?? '#ffe600')
    setHeaderNavText(data?.header_nav_text_color ?? '#333333')
    setHeaderPromo({
      enabled: data?.header_promo_json?.enabled ?? true,
      gifUrl: data?.header_promo_json?.gifUrl ?? '',
      text: data?.header_promo_json?.text ?? '',
      link: data?.header_promo_json?.link ?? '',
      backgroundColor: data?.header_promo_json?.backgroundColor ?? '#fff3c4',
      textColor: data?.header_promo_json?.textColor ?? '#1f2937',
    })
  }

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from('marketing_banners')
      .select('*')
      .order('position', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    setBanners((data ?? []).map((row) => mapBanner(row as Record<string, unknown>)))
  }

  const uploadAsset = async (file: File | null, folder: string, onUploaded: (url: string) => void, fieldId: string) => {
    if (!file) return
    setUploadingField(fieldId)
    setSaveMessage(null)
    setBannerMessage(null)

    try {
      const extension = file.name.split('.').pop() || 'png'
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 42)
      const path = `${folder}/${Date.now()}-${cleanName}.${extension}`
      const { data, error } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

      if (error) throw error

      const { data: publicData } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(data.path)
      onUploaded(publicData.publicUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel enviar a imagem.'
      setSaveMessage(message)
      setBannerMessage(message)
    } finally {
      setUploadingField(null)
    }
  }

  const saveSettings = async () => {
    setSaveMessage(null)

    const { error } = await supabase.from('platform_settings').upsert({
      id: 1,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      browser_title: browserTitle || null,
      browser_title_inactive: browserTitleInactive || null,
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
      logo_desktop_size: desktopLogoSize,
      logo_mobile_size: mobileLogoSize,
      header_topbar_bg_color: headerTopbarBg,
      header_topbar_text_color: headerTopbarText,
      header_nav_bg_color: headerNavBg,
      header_nav_text_color: headerNavText,
      header_promo_json: {
        enabled: headerPromo.enabled,
        gifUrl: headerPromo.gifUrl,
        text: headerPromo.text,
        link: headerPromo.link,
        backgroundColor: headerPromo.backgroundColor,
        textColor: headerPromo.textColor,
      },
    }, { onConflict: 'id' }).select('id').single()

    if (error) {
      setSaveMessage(error.message)
      return
    }

    applyPlatformTheme({ primaryColor, secondaryColor, faviconUrl, browserTitle, browserTitleInactive })
    window.dispatchEvent(new Event('platform-settings-updated'))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetBannerForm = (position: BannerPosition = 'home_hero') => {
    setEditingBannerId(null)
    setBannerForm({ ...emptyBannerForm, position })
    setBannerMessage(null)
  }

  const editBanner = (banner: BannerRecord) => {
    setEditingBannerId(banner.id)
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      image_url: banner.image_url ?? '',
      mobile_image_url: banner.mobile_image_url ?? '',
      link_url: banner.link_url || '/',
      background_color: banner.background_color || '#232f3e',
      position: banner.position,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    })
    setBannerMessage(null)
  }

  const saveBanner = async (event: React.FormEvent) => {
    event.preventDefault()
    setBannerMessage(null)
    setBannerLoading(true)

    if (!bannerForm.title.trim() && !bannerForm.image_url.trim() && !bannerForm.mobile_image_url.trim()) {
      setBannerMessage('Informe uma imagem ou um titulo para o banner.')
      setBannerLoading(false)
      return
    }

    const payload = {
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle || null,
      image_url: bannerForm.image_url || null,
      mobile_image_url: bannerForm.mobile_image_url || null,
      link_url: bannerForm.link_url || '/',
      background_color: bannerForm.background_color,
      position: bannerForm.position,
      sort_order: bannerForm.sort_order,
      is_active: bannerForm.is_active,
    }

    const result = editingBannerId
      ? await supabase.from('marketing_banners').update(payload).eq('id', editingBannerId)
      : await supabase.from('marketing_banners').insert(payload)

    if (result.error) {
      setBannerMessage(result.error.message)
      setBannerLoading(false)
      return
    }

    await loadBanners()
    resetBannerForm(bannerForm.position)
    setBannerMessage(editingBannerId ? 'Banner atualizado.' : 'Banner adicionado.')
    setBannerLoading(false)
  }

  const toggleBannerActive = async (banner: BannerRecord) => {
    const { error } = await supabase.from('marketing_banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    if (error) {
      setBannerMessage(error.message)
      return
    }
    await loadBanners()
    setBannerMessage(!banner.is_active ? 'Banner habilitado.' : 'Banner desabilitado.')
  }

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from('marketing_banners').delete().eq('id', id)
    if (error) {
      setBannerMessage(error.message)
      return
    }
    if (editingBannerId === id) resetBannerForm()
    await loadBanners()
    setBannerMessage('Banner excluido.')
  }

  return (
    <AdminLayout>
      <div className="grid max-w-[1280px] gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#007185]">Personalizacao</p>
            <h2 className="mt-1 text-lg font-bold text-[#111827]">Controle do layout</h2>
            <nav className="mt-4 space-y-1">
              {sectionLinks.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="block rounded-sm px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#007185]">
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 rounded-sm bg-[#f8fafc] p-3 text-xs text-gray-600">
              <p><strong>{activeBannerCount}</strong> banners ativos</p>
              <p><strong>{inactiveBannerCount}</strong> banners desabilitados</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#007185]">Layout Studio</p>
                <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Personalizacao completa da plataforma</h2>
                <p className="mt-1 text-sm text-gray-500">Edite marca, cabecalho, cores, aba do navegador e cada banner da home.</p>
              </div>
              <div className="flex items-center gap-3">
                {saveMessage && <span className="max-w-xs text-sm text-red-600">{saveMessage}</span>}
                {saved && <span className="text-sm text-green-600">Publicado.</span>}
                <Button onClick={saveSettings} className="h-11 rounded-sm bg-[#ff9900] px-5 font-bold text-[#131921] hover:bg-[#ffb84d]">
                  <Save className="mr-2 h-4 w-4" /> Publicar layout
                </Button>
              </div>
            </div>
          </div>

          <Card id="marca" className="rounded-sm border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <SectionTitle title="Marca e imagens principais" subtitle="Controle logo, favicon e tamanho sem depender de links externos." />
              <div className="grid gap-5 lg:grid-cols-2">
                <ImageControl
                  label="Logo da plataforma"
                  helper="PNG ou SVG com fundo transparente."
                  value={logoUrl}
                  previewClassName="h-28"
                  uploading={uploadingField === 'logo'}
                  onUrlChange={setLogoUrl}
                  onUpload={(file) => uploadAsset(file, 'logos', setLogoUrl, 'logo')}
                />
                <ImageControl
                  label="Favicon"
                  helper="Imagem quadrada, ideal 32x32 ou 64x64."
                  value={faviconUrl}
                  previewClassName="h-28"
                  uploading={uploadingField === 'favicon'}
                  onUrlChange={setFaviconUrl}
                  onUpload={(file) => uploadAsset(file, 'favicons', setFaviconUrl, 'favicon')}
                />
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <RangeControl label={`Logo desktop (${desktopLogoSize}px)`} min={50} max={300} value={desktopLogoSize} onChange={setDesktopLogoSize} />
                <RangeControl label={`Logo mobile (${mobileLogoSize}px)`} min={30} max={200} value={mobileLogoSize} onChange={setMobileLogoSize} />
              </div>
            </CardContent>
          </Card>

          <Card id="cabecalho" className="rounded-sm border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <SectionTitle title="Cabecalho independente" subtitle="Mude o topo sem alterar as cores globais da plataforma." />
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ColorControl label="Fundo da faixa superior" value={headerTopbarBg} onChange={setHeaderTopbarBg} />
                    <ColorControl label="Texto da faixa superior" value={headerTopbarText} onChange={setHeaderTopbarText} />
                    <ColorControl label="Fundo do cabecalho" value={headerNavBg} onChange={setHeaderNavBg} />
                    <ColorControl label="Texto do cabecalho" value={headerNavText} onChange={setHeaderNavText} />
                    <ColorControl label="Fundo do aviso/promo" value={headerPromo.backgroundColor} onChange={(value) => setHeaderPromo((current) => ({ ...current, backgroundColor: value }))} />
                    <ColorControl label="Texto do aviso/promo" value={headerPromo.textColor} onChange={(value) => setHeaderPromo((current) => ({ ...current, textColor: value }))} />
                  </div>

                  <label className="flex items-center justify-between rounded-sm border border-gray-200 bg-[#f8fafc] p-3">
                    <span>
                      <span className="block text-sm font-bold text-[#111827]">Mostrar aviso do cabecalho</span>
                      <span className="text-xs text-gray-500">Desative para esconder a faixa promocional sem apagar os dados.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={headerPromo.enabled}
                      onChange={(event) => setHeaderPromo((current) => ({ ...current, enabled: event.target.checked }))}
                      className="h-5 w-5 accent-[#ff9900]"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Texto do aviso">
                      <input value={headerPromo.text} onChange={(event) => setHeaderPromo((current) => ({ ...current, text: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Ex: Ofertas verificadas hoje" />
                    </Field>
                    <Field label="Link do aviso">
                      <input value={headerPromo.link} onChange={(event) => setHeaderPromo((current) => ({ ...current, link: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="/ofertas" />
                    </Field>
                  </div>
                  <ImageControl
                    label="Icone/GIF do aviso"
                    helper="Opcional. Pode ser GIF, SVG ou PNG."
                    value={headerPromo.gifUrl}
                    previewClassName="h-20"
                    uploading={uploadingField === 'header-promo'}
                    onUrlChange={(value) => setHeaderPromo((current) => ({ ...current, gifUrl: value }))}
                    onUpload={(file) => uploadAsset(file, 'header', (url) => setHeaderPromo((current) => ({ ...current, gifUrl: url })), 'header-promo')}
                  />
                </div>

                <div className="rounded-sm border border-gray-200 bg-[#f8fafc] p-4">
                  <p className="mb-3 text-sm font-bold text-[#111827]">Preview do cabecalho</p>
                  <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
                    <div className="flex h-9 items-center justify-between px-3 text-xs" style={{ backgroundColor: headerTopbarBg, color: headerTopbarText }}>
                      <span>Compra segura com vendedores verificados</span>
                      {headerPromo.enabled && headerPromo.text && (
                        <span className="rounded-sm px-2 py-1 font-bold" style={{ backgroundColor: headerPromo.backgroundColor, color: headerPromo.textColor }}>
                          {headerPromo.text}
                        </span>
                      )}
                    </div>
                    <div className="flex h-16 items-center gap-4 px-3" style={{ backgroundColor: headerNavBg, color: headerNavText }}>
                      <span className="font-bold">Cookie market</span>
                      <div className="h-9 flex-1 rounded-sm bg-white/95" />
                      <span className="text-sm font-semibold">Carrinho</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="cores" className="rounded-sm border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <SectionTitle title="Cores globais da plataforma" subtitle="Cores usadas em botoes, destaques e estados gerais. O cabecalho agora tem controles separados." />
              <div className="grid gap-4 md:grid-cols-2">
                <ColorControl label="Cor principal global" value={primaryColor} onChange={setPrimaryColor} />
                <ColorControl label="Cor secundaria global" value={secondaryColor} onChange={setSecondaryColor} />
              </div>
            </CardContent>
          </Card>

          <Card id="aba" className="rounded-sm border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <SectionTitle title="Aba do navegador" subtitle="Controle o texto quando o usuario esta na pagina e quando sai dela." />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titulo com a pagina ativa">
                  <input value={browserTitle} onChange={(event) => setBrowserTitle(event.target.value)} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Cookie market" />
                </Field>
                <Field label="Titulo com a pagina em segundo plano">
                  <input value={browserTitleInactive} onChange={(event) => setBrowserTitleInactive(event.target.value)} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Volte para Cookie market" />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card id="banners" className="rounded-sm border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <SectionTitle title="Banners da plataforma" subtitle="Crie, edite, habilite e desabilite cada campo de banner. Use upload direto ou URL manual." />
              <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <form className="space-y-4 rounded-sm border border-gray-200 bg-[#f8fafc] p-4" onSubmit={saveBanner}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{editingBannerId ? 'Editando banner' : 'Novo banner'}</p>
                      <p className="text-xs text-gray-500">{getBannerPositionLabel(bannerForm.position)}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => resetBannerForm()} className="h-9 rounded-sm">
                      <RotateCcw className="mr-2 h-4 w-4" /> Novo
                    </Button>
                  </div>

                  <label className="flex items-center justify-between rounded-sm border border-gray-200 bg-white p-3">
                    <span>
                      <span className="block text-sm font-bold text-[#111827]">Banner habilitado</span>
                      <span className="text-xs text-gray-500">Quando desligado, nao aparece na home.</span>
                    </span>
                    <input type="checkbox" checked={bannerForm.is_active} onChange={(event) => setBannerForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-5 w-5 accent-[#ff9900]" />
                  </label>

                  <Field label="Posicao exata">
                    <select value={bannerForm.position} onChange={(event) => setBannerForm((current) => ({ ...current, position: event.target.value as BannerPosition }))} className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm">
                      {bannerPositionOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">{bannerPositionOptions.find((option) => option.value === bannerForm.position)?.helper}</p>
                  </Field>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Titulo opcional">
                      <input value={bannerForm.title} onChange={(event) => setBannerForm((current) => ({ ...current, title: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" />
                    </Field>
                    <Field label="Subtitulo opcional">
                      <input value={bannerForm.subtitle} onChange={(event) => setBannerForm((current) => ({ ...current, subtitle: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" />
                    </Field>
                  </div>

                  <ImageControl
                    label="Imagem desktop"
                    helper="Use a arte final do banner."
                    value={bannerForm.image_url}
                    previewClassName="h-28"
                    uploading={uploadingField === 'banner-desktop'}
                    onUrlChange={(value) => setBannerForm((current) => ({ ...current, image_url: value }))}
                    onUpload={(file) => uploadAsset(file, 'banners', (url) => setBannerForm((current) => ({ ...current, image_url: url })), 'banner-desktop')}
                  />
                  <ImageControl
                    label="Imagem mobile"
                    helper="Opcional. Se vazio, usa a imagem desktop."
                    value={bannerForm.mobile_image_url}
                    previewClassName="h-24"
                    uploading={uploadingField === 'banner-mobile'}
                    onUrlChange={(value) => setBannerForm((current) => ({ ...current, mobile_image_url: value }))}
                    onUpload={(file) => uploadAsset(file, 'banners-mobile', (url) => setBannerForm((current) => ({ ...current, mobile_image_url: url })), 'banner-mobile')}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Link de destino">
                      <input value={bannerForm.link_url} onChange={(event) => setBannerForm((current) => ({ ...current, link_url: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="/" />
                    </Field>
                    <Field label="Ordem">
                      <input type="number" value={bannerForm.sort_order} onChange={(event) => setBannerForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" />
                    </Field>
                  </div>
                  <ColorControl label="Cor de fundo fallback" value={bannerForm.background_color} onChange={(value) => setBannerForm((current) => ({ ...current, background_color: value }))} />

                  {bannerMessage && <p className={`rounded-sm p-3 text-sm ${bannerMessage.includes('Banner') || bannerMessage.includes('habilitado') || bannerMessage.includes('desabilitado') || bannerMessage.includes('excluido') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{bannerMessage}</p>}

                  <Button type="submit" disabled={bannerLoading} className="h-11 w-full rounded-sm bg-[#ff9900] font-bold text-[#131921] hover:bg-[#ffb84d]">
                    <Save className="mr-2 h-4 w-4" /> {bannerLoading ? 'Salvando...' : editingBannerId ? 'Salvar banner' : 'Adicionar banner'}
                  </Button>
                </form>

                <div className="space-y-4">
                  {groupedBannerOptions.map(([group, options]) => (
                    <div key={group} className="rounded-sm border border-gray-200 bg-white">
                      <div className="border-b border-gray-100 bg-[#f8fafc] px-4 py-3">
                        <p className="text-sm font-bold text-[#111827]">{group}</p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {options.map((option) => {
                          const positionBanners = banners.filter((banner) => banner.position === option.value)
                          return (
                            <div key={option.value} className="p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-[#111827]">{option.label}</p>
                                  <p className="text-xs text-gray-500">{option.helper}</p>
                                </div>
                                <Button type="button" variant="outline" onClick={() => resetBannerForm(option.value)} className="h-8 rounded-sm px-3 text-xs">
                                  <Plus className="mr-1 h-3.5 w-3.5" /> Novo
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {positionBanners.length === 0 && <p className="rounded-sm border border-dashed border-gray-200 p-3 text-xs text-gray-500">Nenhum banner nesse campo.</p>}
                                {positionBanners.map((banner) => (
                                  <div key={banner.id} className="grid gap-3 rounded-sm border border-gray-200 p-3 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center">
                                    <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-sm bg-gray-100">
                                      {banner.image_url ? <img src={banner.image_url} alt={banner.title || 'Banner'} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-400" />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-bold text-[#111827]">{banner.title || 'Banner sem texto'}</p>
                                        <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-bold ${banner.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                          {banner.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                          {banner.is_active ? 'Ativo' : 'Desativado'}
                                        </span>
                                      </div>
                                      <p className="truncate text-xs text-gray-500">{banner.link_url || '/'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button type="button" onClick={() => toggleBannerActive(banner)} className="rounded-sm border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title={banner.is_active ? 'Desabilitar' : 'Habilitar'}>
                                        {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                      <button type="button" onClick={() => editBanner(banner)} className="rounded-sm border border-gray-200 p-2 text-[#007185] hover:bg-gray-50" title="Editar">
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button type="button" onClick={() => deleteBanner(banner.id)} className="rounded-sm border border-red-100 p-2 text-red-600 hover:bg-red-50" title="Excluir">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div id="publish" className="flex items-center justify-end gap-3 pb-8">
            {saveMessage && <span className="text-sm text-red-600">{saveMessage}</span>}
            {saved && <span className="text-sm text-green-600">Publicado.</span>}
            <Button onClick={saveSettings} className="h-12 rounded-sm bg-[#ff9900] px-8 font-bold text-[#131921] hover:bg-[#ffb84d]">
              <Save className="mr-2 h-4 w-4" /> Publicar alteracoes
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold tracking-tight text-[#111827]">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded-sm border border-gray-300 bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-sm border border-gray-300 px-3 font-mono text-sm" />
      </div>
    </Field>
  )
}

function RangeControl({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#ff9900]" />
    </Field>
  )
}

function ImageControl({
  label,
  helper,
  value,
  previewClassName,
  uploading,
  onUrlChange,
  onUpload,
}: {
  label: string
  helper: string
  value: string
  previewClassName: string
  uploading: boolean
  onUrlChange: (value: string) => void
  onUpload: (file: File | null) => void
}) {
  return (
    <div className="rounded-sm border border-gray-200 bg-[#f8fafc] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#111827]">{label}</p>
          <p className="text-xs text-gray-500">{helper}</p>
        </div>
        {value && (
          <button type="button" onClick={() => onUrlChange('')} className="text-xs font-bold text-red-600 hover:underline">
            Limpar
          </button>
        )}
      </div>
      <div className={`mb-3 flex items-center justify-center overflow-hidden rounded-sm border border-dashed border-gray-300 bg-white ${previewClassName}`}>
        {value ? <img src={value} alt={label} className="h-full w-full object-contain p-2" /> : <ImageIcon className="h-7 w-7 text-gray-300" />}
      </div>
      <div className="grid gap-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-[#007185] hover:bg-gray-50">
          <Upload className="h-4 w-4" />
          {uploading ? 'Enviando...' : 'Enviar imagem'}
          <input
            type="file"
            accept="image/*,.svg,.gif,.ico"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              onUpload(event.target.files?.[0] ?? null)
              event.currentTarget.value = ''
            }}
          />
        </label>
        <input value={value} onChange={(event) => onUrlChange(event.target.value)} className="h-10 w-full rounded-sm border border-gray-300 px-3 text-sm" placeholder="Ou cole uma URL publica" />
      </div>
    </div>
  )
}
