import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGroups, type Group } from '../lib/data'

export function Stories() {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    getGroups(12).then(setGroups).catch(console.error)
  }, [])

  if (groups.length === 0) return null

  return (
    <div className="bg-white py-4 mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-sm font-semibold text-ml-dark">Grupos de Network</h2>
          <Link to="/groups" className="text-ml-blue text-sm font-medium hover:underline">Ver mais</Link>
        </div>

        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-4 items-center">
          {groups.map((group) => (
            <a key={group.id} href={group.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]">
              <div className="w-16 h-16 rounded-full border-[3px] border-green-500 p-[2px] hover:scale-105 transition-transform">
                <img src={group.image || '/favicon.svg'} alt={group.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-xs text-center font-medium text-ml-dark truncate w-full">{group.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
