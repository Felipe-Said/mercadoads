import React from "react"
import { Link } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@radix-ui/react-scroll-area" // Using simple horizontal scroll since I didn't write the scroll-area wrapper yet. Let's write native scroll.

const GROUPS = [
  { id: 1, name: "VIP Ads", image: "https://i.pravatar.cc/150?u=1", sponsored: true },
  { id: 2, name: "Drop Masters", image: "https://i.pravatar.cc/150?u=2", sponsored: false },
  { id: 3, name: "Contigência", image: "https://i.pravatar.cc/150?u=3", sponsored: true },
  { id: 4, name: "Facebook Ads", image: "https://i.pravatar.cc/150?u=4", sponsored: false },
  { id: 5, name: "Google Pro", image: "https://i.pravatar.cc/150?u=5", sponsored: false },
  { id: 6, name: "TikTok Viral", image: "https://i.pravatar.cc/150?u=6", sponsored: true },
  { id: 7, name: "Black Hat", image: "https://i.pravatar.cc/150?u=7", sponsored: false },
  { id: 8, name: "Networking", image: "https://i.pravatar.cc/150?u=8", sponsored: false },
  { id: 9, name: "Lançamentos", image: "https://i.pravatar.cc/150?u=9", sponsored: false },
  { id: 10, name: "PLR Secrets", image: "https://i.pravatar.cc/150?u=10", sponsored: false },
  { id: 11, name: "Afiliados", image: "https://i.pravatar.cc/150?u=11", sponsored: false },
]

export function Stories() {
  const sortedGroups = [...GROUPS].sort((a, b) => {
    if (a.sponsored === b.sponsored) return 0;
    return a.sponsored ? -1 : 1;
  });
  return (
    <div className="bg-white py-4 mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-sm font-semibold text-ml-dark">Grupos de Network</h2>
          <Link to="/groups" className="text-ml-blue text-sm font-medium hover:underline">Ver mais</Link>
        </div>
        
        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-4 items-center">
          {sortedGroups.map((group) => (
            <div key={group.id} className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]">
              <div className="w-16 h-16 rounded-full border-[3px] border-green-500 p-[2px] hover:scale-105 transition-transform">
                <img 
                  src={group.image} 
                  alt={group.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs text-center font-medium text-ml-dark truncate w-full">{group.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
