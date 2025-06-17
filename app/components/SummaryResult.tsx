'use client'

import { useState } from 'react'
import { SummaryData, SummaryOptions } from '../page'

interface SummaryResultProps {
  data: SummaryData
  onReset: () => void
  onRegenerate: (options: SummaryOptions) => void
}

export default function SummaryResult({ data, onReset, onRegenerate }: SummaryResultProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'comparison'>('summary')
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('클립보드에 복사되었습니다.')
    } catch (err) {
      console.error('복사 실패:', err)
      alert('복사에 실패했습니다.')
    }
  }

  const downloadAsText = () => {
    const element = document.createElement('a')
    const file = new Blob([data.summary], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `요약_${data.fileName || '뉴스기사'}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsDocx = async () => {
    try {
      // docx 동적 import
      const { Document, Packer, Paragraph, TextRun } = await import('docx')
      const fileSaver = await import('file-saver')
      const saveAs = fileSaver.default || fileSaver.saveAs
      
      // 간단한 문서 구조로 생성
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '뉴스기사 요약',
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: '',
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
                  }),
                ],
              }),
              
              ...(data.fileName ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `원본 파일: ${data.fileName}`,
                    }),
                  ],
                }),
              ] : []),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: '',
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: '요약 옵션',
                    bold: true,
                  }),
                ],
              }),
              
              ...(data.options.purpose ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `목적: ${data.options.purpose}`,
                    }),
                  ],
                }),
              ] : []),
              
              ...(data.options.style ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `스타일: ${data.options.style}`,
                    }),
                  ],
                }),
              ] : []),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `언어: ${data.options.language}`,
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: '',
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: '요약 내용',
                    bold: true,
                  }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.summary,
                  }),
                ],
              }),
            ],
          },
        ],
      })
      
      // 문서를 blob으로 변환 후 다운로드
      const blob = await Packer.toBlob(doc)
      const fileName = `요약_${new Date().toISOString().split('T')[0]}.docx`
      
      // saveAs 함수가 정상적으로 로드되었는지 확인
      if (typeof saveAs === 'function') {
        saveAs(blob, fileName)
      } else {
        // 대안: 브라우저 기본 다운로드 기능 사용
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
    } catch (error) {
      console.error('DOCX 생성 오류:', error)
      alert(`DOCX 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">요약 결과</h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.fileName ? `파일: ${data.fileName}` : '텍스트 입력'}
            </p>
          </div>
          <button 
            onClick={() => onRegenerate(data.options)}
            className="btn-primary text-sm px-3 py-1"
          >
            재생성
          </button>
        </div>

        {/* 옵션 정보 */}
        <div className="flex flex-wrap gap-2">
          {data.options.purpose && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {data.options.purpose}
            </span>
          )}
          {data.options.style && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {data.options.style}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {data.options.language}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              요약
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              비교
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">요약 내용</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(data.summary)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>복사</span>
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>TXT</span>
                  </button>
                  <button
                    onClick={downloadAsDocx}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>DOCX</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
              </div>
            </div>
                      ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-3">
                  원문 ({data.originalText.length.toLocaleString()}자)
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.originalText}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium mb-3">
                  요약 ({data.summary.length.toLocaleString()}자)
                </h3>
                <div className="bg-primary-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 피드백 섹션 */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <h3 className="text-base font-medium mb-3">피드백</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setFeedback('good')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              feedback === 'good'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>좋아요</span>
          </button>
          <button
            onClick={() => setFeedback('bad')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              feedback === 'bad'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            <span>별로예요</span>
          </button>
        </div>
        {feedback && (
          <p className="mt-2 text-xs text-gray-600">
            피드백을 주셔서 감사합니다.
          </p>
        )}
      </div>
    </div>
  )
} 