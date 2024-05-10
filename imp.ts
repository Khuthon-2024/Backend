function mapResult(code: number): string {
  switch (code) {
    case 0: return "재킷"
    case 1: return "조거팬츠"
    case 2: return "짚업"
    case 3: return "스커트"
    case 4: return "가디건"
    case 5: return "점퍼"
    case 6: return "티셔츠"
    case 7: return "셔츠"
    case 8: return "팬츠"
    case 9: return "드레스"
    case 10: return "패딩"
    case 11: return "청바지"
    case 12: return "점프수트"
    case 13: return "니트웨어"
    case 14: return "베스트"
    case 15: return "코트"
    case 16: return "브라탑"
    case 17: return "블라우스"
    case 18: return "탑"
    case 19: return "후드티"
    case 20: return "레깅스"
    default: return "몰?루"
  }
}

export default {
  async matcher(request: Request): Promise<boolean> {
    const url = new URL(request.url)

    return url.pathname === '/imp'
  },

  async handler(request: Request): Promise<Response> {
    const formData = await request.formData()
    const image = formData.get('originImage') as File

    if (image === null) return new Response('', { status: 400 })

    await Deno.writeFile('./Imp/img/run.jpg', new Uint8Array(await image.arrayBuffer()))

    const imp = new Deno.Command('./venv/bin/python', {
      args: ['./image_to_cate.py'],
      cwd: './Imp'
    })
    const { stdout } = await imp.output()
    const log = new TextDecoder().decode(stdout)

    return new Response(JSON.stringify({ resource: mapResult(JSON.parse(log)[0]) }), { status : 200, headers: {  "content-type": "application/json; charset=utf-8", } })
  }
}