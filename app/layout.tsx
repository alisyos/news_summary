import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '뉴스기사 요약 시스템',
  description: 'OpenAI를 활용한 뉴스기사 요약 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">뉴스기사 요약 시스템</h1>
              <p className="text-sm text-gray-600">AI 기반 맞춤형 요약 서비스</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 