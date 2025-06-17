'use client'

import { useState } from 'react'
import { SummaryOptions } from '../page'

interface SummaryFormProps {
  onSubmit: (options: SummaryOptions) => void
  isLoading: boolean
  disabled?: boolean
}

export default function SummaryForm({ onSubmit, isLoading, disabled }: SummaryFormProps) {
  const [purpose, setPurpose] = useState('')
  const [style, setStyle] = useState('')
  const [language, setLanguage] = useState('한국어')

  const purposes = [
    { value: '', label: '목적 선택 (선택사항)' },
    { value: '정보 파악', label: '정보 파악' },
    { value: '보고용', label: '보고용' },
    { value: 'SNS 공유', label: 'SNS 공유' },
    { value: '보도자료 작성', label: '보도자료 작성' },
    { value: '회의 자료', label: '회의 자료' },
    { value: '개인 학습', label: '개인 학습' },
  ]

  const styles = [
    { value: '', label: '스타일 선택 (선택사항)' },
    { value: '객관적/중립적', label: '객관적/중립적' },
    { value: '친근하게', label: '친근하게' },
    { value: '전문가 시각', label: '전문가 시각' },
    { value: '간결하게', label: '간결하게' },
    { value: '유머러스하게', label: '유머러스하게' },
    { value: '분석적으로', label: '분석적으로' },
  ]

  const languages = [
    { value: '한국어', label: '한국어' },
    { value: '영어', label: '영어' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ purpose, style, language })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* 요약 목적 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요약 목적
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="select-field"
            disabled={disabled || isLoading}
          >
            {purposes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 요약 스타일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요약 스타일
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="select-field"
            disabled={disabled || isLoading}
          >
            {styles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 요약 언어 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요약 언어 <span className="text-red-500">*</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select-field"
            disabled={disabled || isLoading}
            required
          >
            {languages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 선택된 옵션 미리보기 */}
        {(purpose || style) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">선택된 옵션</h3>
            <div className="flex flex-wrap gap-2">
              {purpose && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  목적: {purpose}
                </span>
              )}
              {style && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  스타일: {style}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                언어: {language}
              </span>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>요약 생성 중...</span>
              </>
            ) : (
              <span>기사 요약하기</span>
            )}
          </button>
        </div>
      </form>
    )
} 