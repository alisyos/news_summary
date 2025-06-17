import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 추출된 텍스트에서 불필요한 설명 부분 제거
function cleanExtractedText(text: string): string {
  // 일반적인 AI 설명 패턴들을 제거
  let cleaned = text
    // "아래는 이미지에 있는..." 형태의 서두 제거
    .replace(/^아래는?\s*이미지에?\s*(있는|포함된)?\s*.*?입니다?\s*:?\s*[\r\n]*/gim, '')
    // "---" 구분선과 그 전후 설명 제거
    .replace(/^.*?---\s*[\r\n]*/gm, '')
    .replace(/---.*?$/gm, '')
    // "필요하신 부분 있으시면..." 형태의 마무리 멘트 제거
    .replace(/[\r\n]*필요하신?\s*부분.*?$/gim, '')
    // 기타 설명성 문구들 제거
    .replace(/^.*?텍스트를?\s*(원문\s*)?그대로\s*추출한?\s*내용입니다?\s*:?\s*[\r\n]*/gim, '')
    .replace(/^.*?다음과?\s*같습니다?\s*:?\s*[\r\n]*/gim, '')
    // 연속된 공백과 줄바꿈 정리
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()

  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const text = formData.get('text') as string | null
    const purpose = formData.get('purpose') as string
    const style = formData.get('style') as string
    const language = formData.get('language') as string

    if (!file && !text) {
      return NextResponse.json(
        { error: '파일 또는 텍스트를 제공해주세요.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    let originalText = ''

    if (file) {
      // 파일 처리
      if (file.type.startsWith('image/')) {
        // 이미지 파일인 경우 GPT-4 Vision으로 처리
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mimeType = file.type
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 이미지에서 뉴스 기사 텍스트만을 추출해주세요. 기사 본문만 정확히 추출하고, 추가 설명이나 안내문구는 포함하지 마세요.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4000,
        })

        let extractedText = response.choices[0]?.message?.content || ''
        
        // 불필요한 설명 텍스트 제거
        originalText = cleanExtractedText(extractedText)
      } else if (file.type === 'application/pdf') {
        // PDF 파일 처리
        const arrayBuffer = await file.arrayBuffer()
        
        try {
          // PDF 파싱을 위한 간단한 텍스트 추출
          // 실제 운영환경에서는 pdf-parse 라이브러리 사용 권장
          const text = new TextDecoder().decode(arrayBuffer)
          originalText = text
        } catch (error) {
          return NextResponse.json(
            { error: 'PDF 파일을 읽을 수 없습니다.' },
            { status: 400 }
          )
        }
      } else if (file.type === 'text/plain') {
        // 텍스트 파일 처리
        originalText = await file.text()
      } else {
        return NextResponse.json(
          { error: '지원하지 않는 파일 형식입니다.' },
          { status: 400 }
        )
      }
    } else {
      originalText = text || ''
    }

    if (!originalText.trim()) {
      return NextResponse.json(
        { error: '텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 프롬프트 구성
    let prompt = `다음 뉴스 기사를 요약해주세요:\n\n${originalText}\n\n요약 조건:`
    
    if (language) {
      prompt += `\n- 언어: ${language}로 작성`
    }
    
    if (purpose) {
      prompt += `\n- 목적: ${purpose}에 맞게 요약`
    }
    
    if (style) {
      prompt += `\n- 스타일: ${style} 톤으로 작성`
    }

    prompt += '\n\n핵심 내용을 놓치지 않고 명확하고 간결하게 요약해주세요.'

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: '당신은 뉴스 기사 요약 전문가입니다. 주어진 조건에 맞춰 정확하고 유용한 요약을 제공해주세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content || ''

    if (!summary) {
      return NextResponse.json(
        { error: '요약을 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      originalText,
      summary,
      success: true,
    })

  } catch (error) {
    console.error('요약 처리 오류:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API 키가 유효하지 않습니다.' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return NextResponse.json(
          { error: 'API 사용량이 초과되었습니다.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: '요약 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
} 