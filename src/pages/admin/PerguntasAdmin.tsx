import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { MessageSquare, Reply } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/data'

type Question = {
  id: string
  question: string
  answer: string | null
  created_at: string
  products?: { title: string | null } | null
}

export function PerguntasAdmin() {
  const [activeTab, setActiveTab] = useState<'pendentes' | 'respondidas'>('pendentes')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('product_questions')
      .select('id, question, answer, created_at, products:product_id(title)')
      .order('created_at', { ascending: false })

    if (error) throw error
    setQuestions((data ?? []) as Question[])
  }

  useEffect(() => {
    loadQuestions().catch(console.error)
  }, [])

  const pendingQuestions = useMemo(() => questions.filter((item) => !item.answer), [questions])
  const answeredQuestions = useMemo(() => questions.filter((item) => item.answer), [questions])
  const visibleQuestions = activeTab === 'pendentes' ? pendingQuestions : answeredQuestions

  const handleAnswer = async (id: string) => {
    const answer = answers[id]?.trim()
    if (!answer) return

    const { error } = await supabase
      .from('product_questions')
      .update({ answer, answered_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setAnswers((current) => ({ ...current, [id]: '' }))
    setMessage('Resposta salva.')
    await loadQuestions()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Central de Perguntas (Meus Anuncios)</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button
            onClick={() => setActiveTab('pendentes')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'pendentes' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MessageSquare className="w-4 h-4" /> Pendentes ({pendingQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('respondidas')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'respondidas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Reply className="w-4 h-4" /> Respondidas ({answeredQuestions.length})
          </button>
        </div>

        {message && <p className={`text-sm ${message.includes('salva') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {visibleQuestions.map((item) => (
            <Card key={item.id} className={`bg-white border-t-0 border-r-0 border-b-0 shadow-sm rounded-md ${item.answer ? 'border-l-4 border-l-ml-blue' : 'border-l-4 border-l-red-500'}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-ml-dark mb-1">"{item.question}"</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span className="font-medium text-ml-blue">{item.products?.title ?? 'Produto removido'}</span>
                      <span>|</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>

                    {!item.answer ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={answers[item.id] ?? ''}
                          onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
                          placeholder="Escreva sua resposta..."
                          className="flex-grow h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue text-sm"
                        />
                        <Button onClick={() => handleAnswer(item.id)} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold px-6 rounded-sm shadow-sm h-10">
                          Responder
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-sm border-l-2 border-l-gray-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Sua resposta</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {visibleQuestions.length === 0 && (
            <Card className="bg-white border-none shadow-sm rounded-md">
              <CardContent className="p-8 text-center text-gray-500">
                Nenhuma pergunta {activeTab === 'pendentes' ? 'pendente' : 'respondida'} encontrada.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
