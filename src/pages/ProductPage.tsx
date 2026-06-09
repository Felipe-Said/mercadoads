import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, MessageSquare, Shield, Star, Trophy } from 'lucide-react'
import { RegistrationModal } from '../components/RegistrationModal'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatCurrency, getProduct, type Product } from '../lib/data'
import { supabase } from '../lib/supabase'

type Question = {
  id: string
  question: string
  answer: string | null
  created_at: string
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [question, setQuestion] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [buying, setBuying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      const [productData, questionsResult] = await Promise.all([
        getProduct(id),
        supabase.from('product_questions').select('id, question, answer, created_at').eq('product_id', id).order('created_at', { ascending: false }).limit(5),
      ])

      setProduct(productData)
      if (questionsResult.error) throw questionsResult.error
      setQuestions((questionsResult.data ?? []) as Question[])
    }

    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    setError(null)

    try {
      await addToCart({
        id: Number(product.id),
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel adicionar ao carrinho.')
    }
  }

  const handleBuyNow = async () => {
    if (!product || authLoading || buying) return

    if (!user) {
      setIsModalOpen(true)
      return
    }

    setError(null)
    setBuying(true)

    const { error: saleError } = await supabase.from('sales').insert({
      product_id: Number(product.id),
      buyer_id: user.id,
      seller_id: product.seller_id,
      amount: product.price,
      status: 'pending',
    })

    setBuying(false)

    if (saleError) {
      setError(saleError.message)
      return
    }

    navigate('/painel/usuario/compras')
  }

  const handleQuestion = async () => {
    if (!product || !question.trim()) return
    if (authLoading) return

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
    if (sessionError) {
      setError(sessionError.message)
      return
    }

    const sessionUser = sessionData.user
    if (!sessionUser) {
      setError('Entre na sua conta para perguntar ao vendedor.')
      return
    }

    setError(null)

    const { data, error: insertError } = await supabase
      .from('product_questions')
      .insert({ product_id: product.id, user_id: sessionUser.id, question: question.trim() })
      .select('id, question, answer, created_at')
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    setQuestions((current) => [data as Question, ...current])
    setQuestion('')
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Carregando produto...</div>
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-light text-ml-dark mb-4">Produto nao encontrado</h1>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Link to="/" className="text-ml-blue hover:underline">Voltar a pagina inicial</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#ededed] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="text-sm text-ml-dark flex items-center gap-2 mb-2">
          <Link to="/" className="font-semibold hover:underline">Voltar a lista</Link>
          <span className="text-gray-400">|</span>
          <Link to="/" className="text-ml-blue hover:underline">Inicio</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-500">{product.category ?? 'Ativos Digitais'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {error && <p className="bg-red-50 text-red-600 border border-red-100 rounded-md p-3 mb-4 text-sm">{error}</p>}

        <div className="bg-white rounded-md shadow-sm p-4 md:p-0 flex flex-col md:flex-row">
          <div className="md:w-2/3 md:border-r border-gray-200">
            <div className="flex justify-center items-center p-8 h-[400px] md:h-[600px]">
              <img src={product.image || '/favicon.svg'} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>

            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-normal text-ml-dark mb-6">Descricao</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[17px]">
                {product.description || 'Este vendedor ainda nao cadastrou uma descricao detalhada para o anuncio.'}
              </p>
            </div>

            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-normal text-ml-dark mb-6">Perguntas e respostas</h2>

              <div className="mb-8">
                <p className="text-sm font-semibold text-ml-dark mb-3">Pergunte ao vendedor</p>
                <div className="flex gap-4">
                  <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    type="text"
                    placeholder={user ? 'Escreva sua pergunta...' : 'Entre para perguntar'}
                    disabled={!user}
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-ml-blue focus:ring-1 focus:ring-ml-blue transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <Button onClick={handleQuestion} disabled={!user || authLoading} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold px-8 h-12 rounded-md transition-colors disabled:opacity-60">
                    Perguntar
                  </Button>
                </div>
                {!user && <p className="text-xs text-gray-500 mt-2">Faça login para enviar perguntas ao vendedor.</p>}
              </div>

              <div className="space-y-5">
                <h3 className="font-semibold text-ml-dark">Ultimas perguntas</h3>
                {questions.length === 0 && <p className="text-sm text-gray-500">Ainda nao existem perguntas para este produto.</p>}
                {questions.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-ml-dark">{item.question}</p>
                    </div>
                    {item.answer && <p className="text-sm text-gray-500 pl-6">{item.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-1/3 p-6 md:p-8 flex flex-col gap-6">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-2">Novo | +{product.sales_count} vendidos</div>
              <h1 className="text-xl font-bold text-ml-dark mb-4 leading-tight">{product.title}</h1>

              <div className="flex text-ml-blue text-sm mb-4">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-4 h-4 fill-current" />)}
              </div>

              {product.originalPrice && <div className="text-[14px] text-gray-500 line-through mb-1">{formatCurrency(product.originalPrice)}</div>}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-light text-ml-dark">{formatCurrency(product.price)}</span>
              </div>
              <div className="text-[16px] text-ml-dark mb-6">
                <span className="text-green-500 font-medium">Pagamento via PIX</span>
              </div>

              <div className="mb-6">
                <p className="text-ml-dark font-semibold mb-2 text-[15px]">Estoque disponivel</p>
                <span className="text-gray-500 text-sm">{product.stock ?? 0} unidades</span>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <Button onClick={handleBuyNow} disabled={authLoading || buying} className="w-full h-12 bg-ml-blue hover:bg-ml-hover text-white font-semibold text-base transition-colors rounded-md shadow-sm">
                  {buying ? 'Registrando compra...' : 'Comprar agora'}
                </Button>
                <Button onClick={handleAddToCart} className={`w-full h-12 font-semibold text-base transition-colors rounded-md flex items-center justify-center gap-2 ${addedToCart ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-ml-blue/10 hover:bg-ml-blue/20 text-ml-blue'}`}>
                  {addedToCart ? <><Check className="w-5 h-5" /> Adicionado</> : 'Adicionar ao carrinho'}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-500 leading-tight"><span className="text-ml-blue font-medium">Compra Garantida</span>, receba o produto combinado ou solicite suporte.</p>
                </div>
                <div className="flex gap-3">
                  <Trophy className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-500 leading-tight">Pedido registrado com acompanhamento interno da plataforma.</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-6">
              <h3 className="text-[17px] font-normal text-ml-dark mb-4">Informacoes sobre o vendedor</h3>
              <div className="flex items-start gap-3 mb-5">
                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ml-dark">{product.seller?.full_name ?? 'Vendedor verificado'}</p>
                  <p className="text-[13px] text-gray-500">Mercado Ads</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[13px] text-gray-500 divide-x divide-gray-200">
                <div className="px-1">
                  <p className="text-xl font-normal text-ml-dark mb-1">{product.sales_count}</p>
                  <p className="leading-tight">Vendas registradas</p>
                </div>
                <div className="px-1">Bom atendimento</div>
                <div className="px-1">Suporte interno</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal open={isModalOpen} onOpenChange={setIsModalOpen} product={product} />
    </div>
  )
}
