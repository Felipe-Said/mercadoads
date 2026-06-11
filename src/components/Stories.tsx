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
    <section className="layout-surface w-full rounded-sm px-4 py-3 shadow-sm md:px-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--layout-text-primary)]">Grupos do WhatsApp</h2>
          <p className="text-xs text-[var(--layout-text-muted)]">Stories com comunidades, fornecedores e links verificados.</p>
        </div>
        <Link to="/groups" className="hidden text-sm font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)] sm:block">Ver todos</Link>
      </div>

      <div className="flex min-h-[98px] items-start gap-4 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex w-[74px] flex-col items-center gap-2">
                <div className="h-[66px] w-[66px] animate-pulse rounded-full bg-[var(--layout-subtle-background)]" />
                <div className="h-3 w-14 animate-pulse rounded-full bg-[var(--layout-subtle-background)]" />
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
              <div className="rounded-full p-[2px] transition group-hover/story:scale-105" style={{ background: 'linear-gradient(35deg, var(--layout-success-color), var(--layout-accent-color), var(--layout-link-hover-color))' }}>
                <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full border-2 border-[var(--layout-surface-background)] bg-[var(--layout-subtle-background)]">
                  {group.image ? (
                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                  ) : (
                    <MessageCircle className="h-7 w-7 text-[var(--layout-success-color)]" />
                  )}
                </div>
              </div>
              <span className="w-full truncate text-center text-[11px] font-semibold leading-tight text-[var(--layout-text-primary)] transition-colors group-hover/story:text-[var(--layout-link-color)]">{group.name}</span>
            </a>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-sm border border-dashed border-[var(--layout-border-color)] bg-[var(--layout-subtle-background)] px-4 py-3 text-sm text-[var(--layout-text-muted)]">
            <MessageCircle className="h-5 w-5 text-[var(--layout-success-color)]" />
            Nenhum grupo disponivel no momento.
          </div>
        )}
      </div>
    </section>
  )
}
