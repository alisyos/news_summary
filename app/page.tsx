'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import FileUpload from './components/FileUpload'
import SummaryForm from './components/SummaryForm'
import SummaryResult from './components/SummaryResult'

export interface SummaryOptions {
  purpose: string
  style: string
  language: string
}

export interface SummaryData {
  originalText: string
  summary: string
  options: SummaryOptions
  fileName?: string
}

export default function Home() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
  const [inputText, setInputText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [summaryResult, setSummaryResult] = useState<SummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async (options: SummaryOptions) => {
    if (inputMethod === 'text' && !inputText.trim()) {
      setError('기사 원문을 입력해주세요.')
      return
    }
    
    if (inputMethod === 'file' && !uploadedFile) {
      setError('파일을 업로드해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      
      if (inputMethod === 'file' && uploadedFile) {
        formData.append('file', uploadedFile)
      } else {
        formData.append('text', inputText)
      }
      
      formData.append('purpose', options.purpose)
      formData.append('style', options.style)
      formData.append('language', options.language)

      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`요약 생성 중 오류가 발생했습니다: ${response.statusText}`)
      }

      const result = await response.json()
      
      setSummaryResult({
        originalText: result.originalText,
        summary: result.summary,
        options,
        fileName: inputMethod === 'file' ? uploadedFile?.name : undefined,
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setInputText('')
    setUploadedFile(null)
    setSummaryResult(null)
    setError(null)
  }

  const handleInputMethodChange = (method: 'text' | 'file') => {
    setInputMethod(method)
    setInputText('')
    setUploadedFile(null)
    setError(null)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* 좌측 입력 영역 (2/5) */}
      <div className="w-2/5 flex flex-col">
        {/* 통합 입력 및 옵션 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">기사 요약</h2>
          
          {/* 입력 방법 탭 */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleInputMethodChange('text')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  inputMethod === 'text'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                직접 입력
              </button>
              <button
                onClick={() => handleInputMethodChange('file')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  inputMethod === 'file'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                파일 업로드
              </button>
            </nav>
          </div>

          {/* 입력 영역 */}
          <div className="mb-6 flex-1">
            {inputMethod === 'text' ? (
              /* 텍스트 입력 */
              <div className="h-full flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기사 원문을 입력하세요
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="기사 원문을 여기에 입력하세요..."
                  className="input-field flex-1 resize-none"
                />
              </div>
            ) : (
              /* 파일 업로드 */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  파일을 업로드하세요
                </label>
                <FileUpload
                  onFileSelect={setUploadedFile}
                  selectedFile={uploadedFile}
                  disabled={false}
                />
              </div>
            )}
          </div>

          {/* 요약 옵션 섹션 */}
          <div className="border-t-2 border-gray-300 bg-gray-50 -mx-6 px-6 pt-6 mt-6 rounded-b-lg">
            <SummaryForm
              onSubmit={handleSummarize}
              isLoading={isLoading}
              disabled={
                (inputMethod === 'text' && !inputText.trim()) ||
                (inputMethod === 'file' && !uploadedFile)
              }
            />
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}


        </div>
      </div>

      {/* 우측 결과 영역 (3/5) */}
      <div className="w-3/5 bg-white rounded-lg shadow-sm border overflow-hidden">
        {!summaryResult && !isLoading ? (
          /* 대기 상태 */
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">요약 결과가 여기에 표시됩니다</p>
              <p className="text-sm">기사를 입력하고 요약 옵션을 선택한 후 '기사 요약하기' 버튼을 클릭하세요</p>
            </div>
          </div>
        ) : isLoading ? (
          /* 로딩 상태 */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin mx-auto h-12 w-12 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">요약 생성 중...</p>
              <p className="text-sm text-gray-600">AI가 기사를 분석하고 요약을 생성하고 있습니다</p>
            </div>
          </div>
        ) : summaryResult ? (
          /* 결과 표시 */
          <div className="h-full overflow-y-auto">
            <SummaryResult
              data={summaryResult}
              onReset={handleReset}
              onRegenerate={handleSummarize}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
} 