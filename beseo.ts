import { useEnv } from './useEnv.ts'
import { OpenAI, outdent } from './deps.ts'

const OPENAI_API_KEY = useEnv('OPENAI_API_KEY', 'OpenAI API key')
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

export default {
  async matcher(request: Request): Promise<boolean> {
    const url = new URL(request.url)

    return url.pathname === '/beseo'
  },

  async handler(request: Request): Promise<Response> {
    let body: any

    try {
      body = await request.json()
    } catch {
      return new Response('', { status: 400 })
    }

    if (!Reflect.has(body, 'detail')) return new Response('', { status: 400 })

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: outdent`
            Summarize user's style preference. 
            Read following user's request carefully and find styles the user describes.
            response the style what user describes.
            
            response only by a few words. user wants really short and brief summary.
            here are the examples of conversations. it's encouraged to response by enumerating words.
            
            user said: 저는 힙합 음악에 어울리는 길거리 스타일이 좋아요. 자유분방하고 개성 넘치는 스타일을 원해요.
            your response: 스트릿
            
            user said: 깔끔하고 단정한 스타일이 좋습니다. 회사원들이 하고 다닐 법한 무난하고 지적인 스타일이요.
            your response: 미니멀, 오피스, 
            
            user said:
            your response:
          `
        },
        {
          role: 'user',
          content: outdent`
            user said: ${body.detail ?? ''}
            your response:
          `
        }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: null
    })

    if (completion.choices.length === 0 || completion.choices[0].message.content === null)
      return new Response('{ error: "failed to make preference inference" }', {
        status: 500,
        headers: {
          "content-type": "application/json; charset=utf-8",
        }
      })

    return new Response(JSON.stringify({
      preferred_style: completion.choices[0].message.content.trim()
    }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      }
    })
  }
}