import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'رمضان كريم 2025',
  description: 'Created with v0',
  generator: 'megatron',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
