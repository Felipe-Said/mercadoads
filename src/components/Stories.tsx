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
    <div className="w-full mb-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-2 lg:px-0">
          <h2 className="text-xl font-bold text-gray-800">Categorias Populares</h2>
          <Link to="/groups" className="text-ml-blue text-sm font-semibold hover:underline">Explorar todas</Link>
        </div>

        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-4 items-center min-h-[90px]">
          {loading ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[72px] animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded mt-1"></div>
                </div>
              ))}
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <a key={group.id} href={group.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group/story">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center p-[2px] group-hover/story:shadow-md group-hover/story:border-ml-blue transition-all">
                  <img src={group.image || '/favicon.svg'} alt={group.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center truncate w-full group-hover/story:text-ml-blue transition-colors">{group.name}</span>
              </a>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum grupo disponível no momento.</p>
          )}
        </div>
      </div>
    </div>
  )
}
