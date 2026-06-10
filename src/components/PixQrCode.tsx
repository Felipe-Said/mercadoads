import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type PixQrCodeProps = {
  value: string
}

export function PixQrCode({ value }: PixQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((nextDataUrl) => {
        if (mounted) setDataUrl(nextDataUrl)
      })
      .catch(() => {
        if (mounted) setDataUrl(null)
      })

    return () => {
      mounted = false
    }
  }, [value])

  if (!dataUrl) {
    return (
      <div className="h-44 w-44 rounded-md border border-yellow-200 bg-white flex items-center justify-center text-xs text-gray-400">
        Gerando QR...
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code Pix"
      className="h-44 w-44 rounded-md border border-yellow-200 bg-white p-2"
    />
  )
}
