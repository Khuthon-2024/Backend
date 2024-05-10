import { outdent } from './deps.ts'

import beseo from './beseo.ts'
import imp from './imp.ts'

const routes: Array<{ matcher(request: Request): Promise<boolean>, handler(request: Request): Promise<Response> }>
 = [beseo, imp]

function allowCORS(server: (request: Request) => Promise<Response>): (request: Request) => Promise<Response> {
  return async request => {
    const response = await server(request)

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
    return response
  }
}

Deno.serve(allowCORS(async request => {
  for (const route of routes)
    if (await route.matcher(request)) return route.handler(request)

  console.error(outdent`
    Unhandled server request: ${request.url} (${request.method})
    ${await request.text()}
  `)
  return new Response('', { status: 404 })
}))