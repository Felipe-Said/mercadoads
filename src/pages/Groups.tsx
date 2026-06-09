import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { getGroups, type Group } from '../lib/data'

export function Groups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-ml-dark">Grupos de Network Disponiveis</h1>
        <span className="text-sm text-gray-500">{groups.length} grupos encontrados</span>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando grupos...</p>}
      {!loading && groups.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhum grupo ativo cadastrado.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {groups.map((group) => (
          <a key={group.id} href={group.link} target="_blank" rel="noopener noreferrer" className="block outline-none group/card">
            <Card className="overflow-hidden flex flex-col justify-between bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-md h-full">
              <div>
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative p-4">
                  {group.sponsored && <span className="absolute top-3 left-3 z-20 bg-[#ff7733] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-[3px] shadow-sm">Mais acessado</span>}
                  <img src={group.image || '/favicon.svg'} alt={group.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover/card:scale-105 transition-transform duration-500 ease-out" />
                </div>
                <CardContent className="p-5">
                  <div className="text-[12px] font-semibold text-ml-blue mb-2 uppercase tracking-wide">{group.category}</div>
                  <p className="text-[16px] text-ml-dark font-medium leading-snug mb-3">{group.name}</p>
                  <p className="text-[13px] text-gray-500 mb-2">{group.members.toLocaleString('pt-BR')} membros</p>
                </CardContent>
              </div>

              <div className="p-5 pt-0 mt-2">
                <div className="w-full bg-green-50 text-green-600 group-hover/card:bg-green-500 group-hover/card:text-white text-center font-semibold py-3 text-sm transition-colors rounded-sm">
                  Entrar no grupo
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
