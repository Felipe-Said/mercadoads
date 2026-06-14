import { Link } from 'react-router-dom'

type PolicySection = {
  title: string
  paragraphs: string[]
}

type PolicyPageProps = {
  eyebrow: string
  title: string
  description: string
  sections: PolicySection[]
}

function PolicyPage({ eyebrow, title, description, sections }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] py-8 text-[var(--layout-text-primary)]">
      <main className="mx-auto max-w-5xl px-4">
        <section className="rounded-sm border bg-[var(--layout-surface-background)] p-6 shadow-sm" style={{ borderColor: 'var(--layout-border-color)' }}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--layout-link-color)]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--layout-text-muted)]">{description}</p>
        </section>

        <section className="mt-4 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-sm border bg-[var(--layout-surface-background)] p-5 shadow-sm" style={{ borderColor: 'var(--layout-border-color)' }}>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--layout-text-muted)]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/contato" className="layout-primary-button rounded-sm px-4 py-2 text-sm font-bold">
            Falar com suporte
          </Link>
          <Link to="/" className="rounded-sm border px-4 py-2 text-sm font-bold text-[var(--layout-link-color)]" style={{ borderColor: 'var(--layout-border-color)' }}>
            Voltar para home
          </Link>
        </div>
      </main>
    </div>
  )
}

export function TermsPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Termos e condicoes de uso"
      description="Regras gerais para uso da Cookie market, compra, venda e acesso as ferramentas digitais."
      sections={[
        {
          title: 'Uso da plataforma',
          paragraphs: [
            'A Cookie market conecta compradores, vendedores e ferramentas digitais em um ambiente de comercio online. Ao usar a plataforma, o usuario concorda em fornecer dados verdadeiros, manter sua conta segura e respeitar as regras de uso.',
            'E proibido publicar conteudo ilegal, fraudulento, enganoso, ofensivo ou que viole direitos de terceiros. A plataforma pode remover anuncios, bloquear contas ou reter analises quando houver risco operacional ou violacao das regras.',
          ],
        },
        {
          title: 'Compras e pagamentos',
          paragraphs: [
            'As compras podem ser pagas pelos meios disponiveis na finalizacao do pedido, incluindo saldo interno quando habilitado. Pedidos sem pagamento confirmado podem ser cancelados.',
            'O comprador deve conferir produto, descricao, prazo e informacoes antes de concluir a compra. Produtos digitais podem ter regras especificas de entrega, ativacao e uso.',
          ],
        },
        {
          title: 'Vendedores e produtos oficiais',
          paragraphs: [
            'Vendedores sao responsaveis pela veracidade dos produtos anunciados, entrega, suporte e cumprimento das politicas da plataforma.',
            'Produtos cadastrados por contas administrativas podem ser exibidos como produtos oficiais da plataforma.',
          ],
        },
      ]}
    />
  )
}

export function PrivacyPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Politica de privacidade"
      description="Como tratamos dados de cadastro, navegacao, compras, seguranca e suporte."
      sections={[
        {
          title: 'Dados coletados',
          paragraphs: [
            'Podemos coletar dados de cadastro, contato, historico de compras, interacoes com produtos, buscas realizadas, dados de pagamento necessarios para processamento e informacoes tecnicas de acesso.',
            'Esses dados sao usados para operar a plataforma, personalizar recomendacoes, prevenir fraude, melhorar a seguranca e prestar suporte.',
          ],
        },
        {
          title: 'Compartilhamento',
          paragraphs: [
            'Dados podem ser compartilhados com provedores essenciais para processamento de pagamentos, entrega digital, seguranca, atendimento e cumprimento de obrigacoes legais.',
            'Nao vendemos dados pessoais. Informacoes sao tratadas conforme necessidade operacional e medidas de seguranca razoaveis.',
          ],
        },
        {
          title: 'Controle do usuario',
          paragraphs: [
            'O usuario pode atualizar dados da conta nas configuracoes e solicitar suporte para duvidas sobre privacidade, acesso, correcao ou remocao de informacoes quando aplicavel.',
          ],
        },
      ]}
    />
  )
}

export function RefundPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Reembolso e disputas"
      description="Regras para contestacoes, cancelamentos e analise de problemas apos a compra."
      sections={[
        {
          title: 'Janela de reclamacao',
          paragraphs: [
            'Apos a confirmacao da compra, o comprador possui uma janela de 24 horas para abrir reclamacao quando houver problema com entrega, acesso ou divergencia relevante do produto.',
            'Se nao houver reclamacao dentro do prazo, o valor podera seguir o fluxo normal de liberacao ao vendedor conforme as regras internas da plataforma.',
          ],
        },
        {
          title: 'Analise de disputas',
          paragraphs: [
            'Disputas podem exigir evidencias do comprador e do vendedor. A plataforma pode avaliar comprovantes, conversas, dados de entrega e historico do pedido.',
            'Reembolsos podem ser totais, parciais ou recusados conforme o caso, tipo de produto, uso do servico e evidencias apresentadas.',
          ],
        },
        {
          title: 'Pedidos nao pagos',
          paragraphs: [
            'Pedidos sem pagamento concluido podem ser cancelados pelo comprador ou removidos conforme limpeza operacional da plataforma.',
          ],
        },
      ]}
    />
  )
}

export function DeliveryPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Politica de entrega digital"
      description="Como funcionam entregas de produtos digitais, ferramentas, arquivos, credenciais e servicos conectados."
      sections={[
        {
          title: 'Entrega de produtos',
          paragraphs: [
            'Produtos digitais podem ser entregues por arquivo, texto, credenciais, orientacoes do vendedor ou liberacao automatica dentro da area de compras.',
            'O vendedor deve manter a entrega clara, funcional e compativel com a descricao do anuncio.',
          ],
        },
        {
          title: 'Ferramentas da plataforma',
          paragraphs: [
            'Ferramentas conectadas, como proxy, SMM, numero virtual e email temporario, seguem disponibilidade, parametros e retorno tecnico dos fornecedores integrados.',
            'O comprador deve preencher corretamente os dados solicitados para que a entrega seja processada.',
          ],
        },
        {
          title: 'Suporte pos-compra',
          paragraphs: [
            'Quando houver dificuldade de acesso ou uso, o comprador deve buscar suporte pela area de compras ou contato da plataforma dentro do prazo aplicavel.',
          ],
        },
      ]}
    />
  )
}

export function CommunityPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Regras da comunidade"
      description="Conduta esperada para compradores, vendedores, afiliados e usuarios em geral."
      sections={[
        {
          title: 'Conduta',
          paragraphs: [
            'Usuarios devem agir com respeito, boa-fe e responsabilidade nas compras, vendas, perguntas, avaliacoes, afiliacoes e grupos publicados.',
            'Nao sao permitidos golpes, spam, falsa identidade, assedio, ameacas, manipulacao de avaliacao ou tentativa de burlar regras da plataforma.',
          ],
        },
        {
          title: 'Anuncios e grupos',
          paragraphs: [
            'Anuncios e grupos devem conter informacoes coerentes, links validos e conteudo permitido. A plataforma pode remover conteudos duplicados, enganosos ou fora das regras.',
          ],
        },
        {
          title: 'Medidas de seguranca',
          paragraphs: [
            'Contas podem ser revisadas, congeladas ou bloqueadas quando houver risco para usuarios, vendedores, pagamentos ou reputacao da plataforma.',
          ],
        },
      ]}
    />
  )
}

export function AccessibilityPolicy() {
  return (
    <PolicyPage
      eyebrow="Politicas da plataforma"
      title="Acessibilidade"
      description="Compromisso da Cookie market com navegacao clara, legivel e utilizavel em diferentes dispositivos."
      sections={[
        {
          title: 'Experiencia de uso',
          paragraphs: [
            'Buscamos manter paginas responsivas, textos legiveis, contraste adequado e navegacao consistente para compradores, vendedores e administradores.',
            'A plataforma recebe melhorias continuas para reduzir barreiras de uso em dispositivos moveis e desktop.',
          ],
        },
        {
          title: 'Solicitacao de melhoria',
          paragraphs: [
            'Caso encontre dificuldade de acesso, leitura, navegacao ou uso de algum recurso, entre em contato com o suporte informando a pagina e o problema encontrado.',
          ],
        },
      ]}
    />
  )
}

export function WorkWithUsPolicy() {
  return (
    <PolicyPage
      eyebrow="Institucional"
      title="Trabalhe conosco"
      description="Espaco para parcerias, operacao, suporte, fornecedores, afiliados e oportunidades comerciais."
      sections={[
        {
          title: 'Parcerias e fornecedores',
          paragraphs: [
            'A Cookie market pode avaliar parcerias com fornecedores, vendedores especializados, operadores de suporte, produtores digitais e servicos que agreguem valor ao marketplace.',
            'Propostas devem apresentar atividade, experiencia, canais de contato e detalhes do modelo comercial desejado.',
          ],
        },
        {
          title: 'Como falar com a plataforma',
          paragraphs: [
            'Use a pagina de contato para enviar propostas comerciais, solicitacoes formais ou oportunidades de colaboracao.',
          ],
        },
      ]}
    />
  )
}
