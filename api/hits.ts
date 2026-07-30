/* visits + clicks as immutable event blobs. vercel blob overwrites are
   eventually consistent (~60s window), so a read-modify-write counter
   rolls itself backwards under any concurrency — verified, not theory.
   unique-key puts never conflict, and a list() sweep only ever lags the
   truth, never regresses it. fine up to tens of thousands of events;
   past that, add compaction. */
import { list, put } from '@vercel/blob'

/* click events carry their batch size in the name: c/<n>-<uuid> */
async function sweep(ownKey?: string) {
  let visits = 0
  let clicks = 0
  let sawOwn = false
  for (const prefix of ['v/', 'c/'] as const) {
    let cursor: string | undefined
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      for (const b of page.blobs) {
        if (b.pathname === ownKey) sawOwn = true
        if (prefix === 'v/') visits += 1
        else clicks += parseInt(b.pathname.slice(2), 10) || 0
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
  }
  return { visits, clicks, sawOwn }
}

export async function GET() {
  const { visits, clicks } = await sweep()
  return Response.json({ visits, clicks })
}

export async function POST(req: Request) {
  const params = new URL(req.url).searchParams
  const isClick = params.get('k') === 'click'
  /* cap n so a hand-rolled request can't jump the counter by millions */
  const n = Math.min(Math.max(parseInt(params.get('n') ?? '1', 10) || 1, 1), 200)
  const key = isClick ? `c/${n}-${crypto.randomUUID()}` : `v/${crypto.randomUUID()}`
  await put(key, '1', { access: 'public', addRandomSuffix: false })

  /* the fresh event may not have reached list() yet — count it by hand */
  const { visits, clicks, sawOwn } = await sweep(key)
  const own = sawOwn ? 0 : 1
  return Response.json({
    visits: visits + (isClick ? 0 : own),
    clicks: clicks + (isClick ? own * n : 0),
  })
}
