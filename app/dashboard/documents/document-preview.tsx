"use client"

import { useState } from "react"
import Image from "next/image"
import { FileText, ImageIcon } from "lucide-react"

interface DocumentPreviewProps {
  url: string
  title: string
}

export default function DocumentPreview({ url, title }: DocumentPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = url.match(/\.pdf$/i)

  if (isImage && !imageError) {
    return (
      <div className="relative aspect-[4/3] w-full max-w-[180px] mx-auto">
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <Image
            src={url}
            alt={`${title} preview`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true)
              setIsLoading(false)
            }}
          />
        </div>
      </div>
    )
  }

  // Fallback for PDFs or when image fails to load
  return (
    <div className="relative aspect-[4/3] w-full max-w-[180px] mx-auto">
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-xs text-blue-600 font-medium">
            {isPdf ? 'PDF Document' : 'Document'}
          </p>
        </div>
      </div>
    </div>
  )
}
