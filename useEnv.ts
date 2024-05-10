import { outdent } from './deps.ts'

export function useEnv(key: string, usage?: string): string {
  const variable = Deno.env.get(key)

  if (variable === undefined)
    throw new Error(outdent`
      ${usage ?? `'${key}'`} is not registered, please define environment variable '${key}'
    `)

  return variable
}