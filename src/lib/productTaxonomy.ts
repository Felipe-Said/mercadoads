export type ProductTaxonomyItem = {
  label: string
  value: string
}

export type ProductTaxonomyGroup = {
  brand: 'meta' | 'google' | 'tiktok' | 'shopify'
  label: string
  items: Array<{
    label: string
    children: ProductTaxonomyItem[]
  }>
}

export const productTaxonomy: ProductTaxonomyGroup[] = [
  {
    brand: 'meta',
    label: 'Meta',
    items: [
      {
        label: 'Perfis',
        children: [
          { label: 'Restabelecido', value: 'Meta / Perfis / Restabelecido' },
          { label: 'Novo', value: 'Meta / Perfis / Novo' },
          { label: 'Verificado', value: 'Meta / Perfis / Verificado' },
        ],
      },
      {
        label: "BM's",
        children: [
          { label: 'Verificada restabelecida', value: "Meta / BM's / Verificada restabelecida" },
          { label: 'Verificada', value: "Meta / BM's / Verificada" },
        ],
      },
      {
        label: 'Contas de anuncios',
        children: [
          { label: 'Ciclo automatico R$250', value: 'Meta / Contas de anuncios / Ciclo automatico R$250' },
          { label: 'Ciclo automatico R$450', value: 'Meta / Contas de anuncios / Ciclo automatico R$450' },
          { label: 'Ciclo automatico R$900', value: 'Meta / Contas de anuncios / Ciclo automatico R$900' },
          { label: 'Ciclo automatico R$1.350', value: 'Meta / Contas de anuncios / Ciclo automatico R$1.350' },
          { label: 'Ciclo automatico R$2.500', value: 'Meta / Contas de anuncios / Ciclo automatico R$2.500' },
        ],
      },
    ],
  },
  {
    brand: 'google',
    label: 'Google',
    items: [
      {
        label: 'Contas Google Ads',
        children: [
          { label: 'Verificado anunciante', value: 'Google / Verificado anunciante' },
          { label: 'Verificado operacao comercial', value: 'Google / Verificado operacao comercial' },
          { label: 'Restabelecida', value: 'Google / Restabelecida' },
        ],
      },
    ],
  },
  {
    brand: 'tiktok',
    label: 'TikTok',
    items: [
      {
        label: 'Contas TikTok Ads',
        children: [
          { label: 'Conta nova', value: 'TikTok / Conta nova' },
          { label: 'Conta restabelecida 1x', value: 'TikTok / Conta restabelecida 1x' },
          { label: 'Conta restabelecida 2x', value: 'TikTok / Conta restabelecida 2x' },
        ],
      },
    ],
  },
  {
    brand: 'shopify',
    label: 'Shopify',
    items: [
      {
        label: 'Shopify',
        children: [
          { label: 'Shopify Payments', value: 'Shopify / Shopify Payments' },
          { label: 'Shopify Temas', value: 'Shopify / Shopify Temas' },
        ],
      },
    ],
  },
]

export const productCategoryOptions = productTaxonomy.flatMap((group) =>
  group.items.flatMap((item) => item.children),
)
