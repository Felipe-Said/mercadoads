import React from 'react'
import { Card, CardContent } from '../components/ui/card'

const GROUPS = [
  { id: 1, name: "VIP Ads Masterclass", members: "234", category: "Tráfego Pago", link: "https://chat.whatsapp.com/sample1", image: "https://i.pravatar.cc/150?u=1", sponsored: true },
  { id: 2, name: "Drop Masters Brasil", members: "1024", category: "Dropshipping", link: "https://chat.whatsapp.com/sample2", image: "https://i.pravatar.cc/150?u=2", sponsored: false },
  { id: 3, name: "Contigência Black Hat", members: "89", category: "Contingência", link: "https://chat.whatsapp.com/sample3", image: "https://i.pravatar.cc/150?u=3", sponsored: true },
  { id: 4, name: "Facebook Ads Escala", members: "512", category: "Tráfego Pago", link: "https://chat.whatsapp.com/sample4", image: "https://i.pravatar.cc/150?u=4", sponsored: false },
  { id: 5, name: "Google Pro Network", members: "450", category: "Tráfego Pago", link: "https://chat.whatsapp.com/sample5", image: "https://i.pravatar.cc/150?u=5", sponsored: false },
  { id: 6, name: "TikTok Viral Trends", members: "800", category: "Social Media", link: "https://chat.whatsapp.com/sample6", image: "https://i.pravatar.cc/150?u=6", sponsored: true },
  { id: 7, name: "Lançamentos Digitais", members: "300", category: "Lançamentos", link: "https://chat.whatsapp.com/sample9", image: "https://i.pravatar.cc/150?u=9", sponsored: false },
  { id: 8, name: "PLR Secrets", members: "150", category: "PLR", link: "https://chat.whatsapp.com/sample10", image: "https://i.pravatar.cc/150?u=10", sponsored: false },
  { id: 9, name: "Afiliados de Sucesso", members: "900", category: "Afiliados", link: "https://chat.whatsapp.com/sample11", image: "https://i.pravatar.cc/150?u=11", sponsored: false },
]

export function Groups() {
  const sortedGroups = [...GROUPS].sort((a, b) => {
    if (a.sponsored === b.sponsored) return 0;
    return a.sponsored ? -1 : 1;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-ml-dark">Grupos de Network Disponíveis</h1>
        <span className="text-sm text-gray-500">{GROUPS.length} grupos encontrados</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedGroups.map((group) => (
          <a key={group.id} href={group.link} target="_blank" rel="noopener noreferrer" className="block outline-none group/card">
            <Card className="overflow-hidden flex flex-col justify-between bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-md h-full">
              <div>
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative p-4">
                  {group.sponsored && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-[#ff7733] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-[3px] shadow-sm">
                        Mais acessado
                      </span>
                    </div>
                  )}
                  <img 
                    src={group.image} 
                    alt={group.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover/card:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="text-[12px] font-semibold text-ml-blue mb-2 uppercase tracking-wide">
                    {group.category}
                  </div>
                  
                  <p className="text-[16px] text-ml-dark font-medium leading-snug mb-3">
                    {group.name}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {group.members} membros
                    </span>
                  </div>
                </CardContent>
              </div>
              
              <div className="p-5 pt-0 mt-2">
                <div className="w-full bg-green-50 text-green-600 group-hover/card:bg-green-500 group-hover/card:text-white text-center font-semibold py-3 text-sm transition-colors rounded-sm flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path fill="currentColor" d="M21.98 11.41c-.34-5.8-5.61-10.27-11.68-9.27-4.18.69-7.53 4.08-8.18 8.26-.38 2.42.12 4.71 1.21 6.6l-.89 3.31c-.2.75.49 1.43 1.23 1.22l3.26-.9c1.48.87 3.21 1.37 5.06 1.37 5.64 0 10.32-4.97 9.99-10.59zm-5.1 4.31a2.279 2.279 0 01-1.16 1.1c-.3.13-.63.19-.98.19-.51 0-1.06-.12-1.63-.37a9.16 9.16 0 01-1.72-.99c-.58-.42-1.12-.89-1.64-1.4-.52-.52-.98-1.07-1.4-1.64-.41-.57-.74-1.14-.98-1.71-.24-.57-.36-1.12-.36-1.64 0-.34.06-.67.18-.97.12-.31.31-.59.58-.84.32-.32.67-.47 1.04-.47.14 0 .28.03.41.09.13.06.25.15.34.28l1.16 1.64c.09.13.16.24.2.35.05.11.07.21.07.31 0 .12-.04.24-.11.36s-.16.24-.28.36l-.38.4c-.06.06-.08.12-.08.2 0 .04.01.08.02.12.02.04.03.07.04.1.09.17.25.38.47.64a13.482 13.482 0 001.53 1.53c.26.22.48.37.65.46.03.01.06.03.09.04.04.02.08.02.13.02.09 0 .15-.03.21-.09l.38-.38c.13-.13.25-.22.36-.28.12-.07.23-.11.36-.11.1 0 .2.02.31.07.11.05.23.11.35.2l1.66 1.18c.13.09.22.2.28.32.05.13.08.25.08.39-.06.17-.1.36-.18.54z"></path>
                  </svg>
                  Entrar no Grupo
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
