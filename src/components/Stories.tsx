import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
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
    <section className="w-full rounded-sm border border-gray-100 bg-white px-4 py-3 shadow-sm md:px-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Grupos do WhatsApp</h2>
          <p className="text-xs text-gray-500">Stories com comunidades, fornecedores e links verificados.</p>
        </div>
        <Link to="/groups" className="hidden text-sm font-semibold text-[#007185] hover:text-[#c7511f] sm:block">Ver todos</Link>
      </div>

      <div className="flex min-h-[98px] items-start gap-4 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex w-[74px] flex-col items-center gap-2">
                <div className="h-[66px] w-[66px] animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-14 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <a
              key={group.id}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/story flex w-[76px] shrink-0 flex-col items-center gap-2 outline-none"
            >
              <div className="rounded-full bg-gradient-to-tr from-[#25d366] via-[#ff9900] to-[#c13584] p-[2px] transition group-hover/story:scale-105">
                <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-50">
                  {group.image ? (
                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                  ) : (
                    <MessageCircle className="h-7 w-7 text-[#25d366]" />
                  )}
                </div>
              </div>
              <span className="w-full truncate text-center text-[11px] font-semibold leading-tight text-gray-700 transition-colors group-hover/story:text-[#007185]">{group.name}</span>
            </a>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-sm border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            <MessageCircle className="h-5 w-5 text-[#25d366]" />
            Nenhum grupo disponivel no momento.
          </div>
        )}
      </div>
    </section>
  )
}
