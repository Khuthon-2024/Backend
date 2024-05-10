import { encode } from "https://deno.land/std@0.148.0/encoding/base64.ts";

async function loadData(imagePath: string, instructionPath: string): Promise<{ image: string, steps: string[] }> {
  const image = encode(await Deno.readFile(imagePath))
  const steps = (await Deno.readTextFile(instructionPath)).split('\n')

  return { image, steps }
}

export default {
  async matcher(request: Request): Promise<boolean> {
    const url = new URL(request.url)

    return url.pathname === '/stylednn'
  },

  // recos: Array<{ image: string, steps: Array<string> }> image is base64 encoded
  async handler(request: Request): Promise<Response> {
    const formData = await request.formData()

    const originImage = formData.get('originImage') as File
    const style = formData.get('style') as string
    const goal = formData.get('goal') as string

    console.log(originImage)
    console.log(style)
    console.log(goal)

    return new Response(JSON.stringify([
      await loadData('./StyleDNN/test.png', './StyleDNN/inst-1.txt'),
      await loadData('./StyleDNN/test.png', './StyleDNN/inst-2.txt'),
      await loadData('./StyleDNN/test.png', './StyleDNN/inst-3.txt'),
      //await loadData('./StyleDNN/image-4.png', './StyleDNN/inst-4.txt'),
      //await loadData('./StyleDNN/image-5.png', './StyleDNN/inst-5.txt'),
    ]), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      }
    })
  }
}