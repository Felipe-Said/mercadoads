import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const BANNERS = [
  {
    id: 1,
    image: "https://http2.mlstatic.com/D_NQ_858591-MLA76953259972_062024-OO.webp",
    alt: "Promoção BM Ilimitada",
    color: "bg-[#1E1E1E]"
  },
  {
    id: 2,
    image: "https://http2.mlstatic.com/D_NQ_709295-MLA76868512521_062024-OO.webp",
    alt: "Contas Facebook Verificadas",
    color: "bg-[#5A2D82]"
  },
  {
    id: 3,
    image: "https://http2.mlstatic.com/D_NQ_686256-MLA76550751917_062024-OO.webp",
    alt: "Pacote Contingência Pro",
    color: "bg-[#0038A8]"
  }
]

export function Banners() {
  const [current, setCurrent] = useState(0)

  // Simulating active sponsorships for flyers (in a real app, this comes from the backend)
  const activeLeftFlyer = true;
  const activeRightFlyer = true;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1))
  const prev = () => setCurrent((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1))

  return (
    <div className="relative w-full mb-8">
      {/* Outer container to hold flyers if screen is wide enough */}
      <div className="max-w-[1600px] mx-auto relative flex justify-center">
        
        {/* Left Flyer (Desktop Only) */}
        {activeLeftFlyer && (
          <div className="hidden 2xl:flex absolute left-0 top-0 h-[340px] md:h-[400px] w-[150px] bg-red-500 rounded-sm shadow-md flex-col justify-center items-center cursor-pointer hover:opacity-90 transition-opacity">
            <span className="bg-white text-ml-dark px-3 py-1 font-bold rounded-sm shadow-sm rotate-[-90deg] whitespace-nowrap">
              Campo do Flyer 1
            </span>
          </div>
        )}

        {/* Center Banner Carousel */}
        <div className="relative w-full max-w-7xl overflow-hidden group">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-[340px] md:h-[400px]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <div 
            key={banner.id} 
            className={`w-full flex-shrink-0 relative ${banner.color} flex items-center justify-center`}
          >
            {/* The ML banners are usually wide images, we simulate by centering them and matching the color */}
            <div className="w-full max-w-7xl h-full flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent z-10" />
               <div className="z-20 text-white text-center p-8">
                 <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.alt}</h2>
                 <p className="text-lg md:text-2xl mb-6">Ofertas exclusivas para alavancar seu ROI</p>
                 <button className="bg-white text-ml-blue font-bold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-lg">
                   Ver Ofertas
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ml-blue p-4 shadow-md rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === idx ? "bg-white w-4" : "bg-white/50"
            }`}
          />
        ))}
      </div>
      </div>

      {/* Right Flyer (Desktop Only) */}
      {activeRightFlyer && (
        <div className="hidden 2xl:flex absolute right-0 top-0 h-[340px] md:h-[400px] w-[150px] bg-red-500 rounded-sm shadow-md flex-col justify-center items-center cursor-pointer hover:opacity-90 transition-opacity">
          <span className="bg-white text-ml-dark px-3 py-1 font-bold rounded-sm shadow-sm rotate-90 whitespace-nowrap">
            Campo do Flyer 2
          </span>
        </div>
      )}
      
      </div>
    </div>
  )
}
