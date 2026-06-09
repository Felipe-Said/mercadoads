import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'

type Question = { id: string; question: string; answer: string | null; products?: { title: string | null } | null }

export function PerguntasAdmin() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    supabase.from('product_questions').select('id, question, answer, products(title)').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setQuestions((data ?? []) as Question[])
      })
      .catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Perguntas</h2>
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-4">Produto</th><th className="px-6 py-4">Pergunta</th><th className="px-6 py-4">Resposta</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((item) => <tr key={item.id}><td className="px-6 py-4">{item.products?.title ?? 'Produto'}</td><td className="px-6 py-4">{item.question}</td><td className="px-6 py-4">{item.answer ?? 'Pendente'}</td></tr>)}
              {questions.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={3}>Nenhuma pergunta encontrada.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  )
}
