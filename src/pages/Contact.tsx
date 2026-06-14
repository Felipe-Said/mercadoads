import React from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Whatsapp } from 'iconsax-react'

export function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 mb-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-light text-ml-dark mb-3">Como podemos ajudar?</h1>
        <p className="text-gray-500">Selecione o canal de atendimento de sua preferência abaixo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="block outline-none group/card">
          <Card className="overflow-hidden flex flex-col justify-between bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-md h-full cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 group-hover/card:scale-110 transition-transform">
                <Whatsapp size="32" variant="Bold" color="currentColor" />
              </div>
              <h2 className="text-xl font-medium text-ml-dark mb-2">WhatsApp</h2>
              <p className="text-gray-500 text-sm mb-6">
                Atendimento rápido para dúvidas, suporte com compras ou denúncias.
              </p>
              <span className="text-ml-blue font-semibold group-hover/card:underline">Iniciar conversa</span>
            </CardContent>
          </Card>
        </a>

        <a href="mailto:suporte@mercadoads.com.br" className="block outline-none group/card">
          <Card className="overflow-hidden flex flex-col justify-between bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-md h-full cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-ml-blue group-hover/card:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-ml-dark mb-2">E-mail</h2>
              <p className="text-gray-500 text-sm mb-6">
                Para assuntos empresariais, parcerias comerciais ou solicitações formais.
              </p>
              <span className="text-ml-blue font-semibold group-hover/card:underline">Enviar e-mail</span>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  )
}
