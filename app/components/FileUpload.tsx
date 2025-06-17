'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  disabled?: boolean
}

export default function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled,
  })

  const removeFile = () => {
    onFileSelect(null)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        파일 업로드 (PDF, PNG, GIF, JPG, TXT)
      </label>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p>파일을 여기에 놓으세요</p>
              ) : disabled ? (
                <p className="text-gray-400">텍스트 입력 시 파일 업로드 불가</p>
              ) : (
                <>
                  <p><span className="font-medium text-primary-600">클릭하여 파일 선택</span> 또는 드래그하여 업로드</p>
                  <p className="text-xs text-gray-500">PDF, PNG, GIF, JPG, TXT (최대 10MB)</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 