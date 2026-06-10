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
    <div className="bg-white py-4 mb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-sm font-semibold text-ml-dark">Grupos de Network</h2>
          <Link to="/groups" className="text-ml-blue text-sm font-medium hover:underline">Ver mais</Link>
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
              <a key={group.id} href={group.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]">
                <div className="w-16 h-16 rounded-full border-[3px] border-green-500 p-[2px] hover:scale-105 transition-transform">
                  <img src={group.image || '/favicon.svg'} alt={group.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-xs text-center font-medium text-ml-dark truncate w-full">{group.name}</span>
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
