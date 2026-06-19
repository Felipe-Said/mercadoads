import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type PixQrCodeProps = {
  value: string
}

export function PixQrCode({ value }: PixQrCodeProps) {
  const [svgStr, setSvgStr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    if (!value) {
      setSvgStr(null)
      return
    }

    QRCode.toString(value, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((svg) => {
        if (mounted) setSvgStr(svg)
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err)
        if (mounted) setSvgStr(null)
      })

    return () => {
      mounted = false
    }
  }, [value])

  if (!svgStr) {
    return (
      <div className="h-44 w-44 rounded-md border border-yellow-200 bg-white flex items-center justify-center text-xs text-gray-400 text-center p-4">
        {value ? 'Erro ao gerar QR' : 'Gerando QR...'}
      </div>
    )
  }

  return (
    <div
      className="h-44 w-44 rounded-md border border-yellow-200 bg-white p-2 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  )
}
