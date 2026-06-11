import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGroups, type Group } from '../lib/data'

export function Stories() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroups(12)
      .then(data => {
        setGroups(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <section className="w-full rounded-md border border-gray-100 bg-white px-4 py-4 shadow-sm md:px-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">Categorias populares</h2>
          <p className="text-xs text-gray-500">Acesse grupos, fornecedores e comunidades verificadas.</p>
        </div>
        <Link to="/groups" className="text-sm font-semibold text-ml-blue hover:text-ml-hover">Explorar todas</Link>
      </div>

      <div className="flex min-h-[92px] items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[86px] w-[104px] animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <a
              key={group.id}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/story flex min-w-[116px] flex-col items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-3 transition hover:border-ml-blue/40 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                <img src={group.image || '/favicon.svg'} alt={group.name} className="h-full w-full object-cover" />
              </div>
              <span className="w-full truncate text-center text-xs font-semibold text-gray-700 transition-colors group-hover/story:text-ml-blue">{group.name}</span>
            </a>
          ))
        ) : (
          <p className="text-sm text-gray-500">Nenhum grupo disponivel no momento.</p>
        )}
      </div>
    </section>
  )
}
