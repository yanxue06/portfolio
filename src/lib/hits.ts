/* the site's own hit counter — one visit per browser session (refreshes
   don't inflate it), clicks batched and flushed when the page hides so the
   whole thing costs one request per session. plain `bun run dev` has no
   /api, so everything degrades to null silently. */

export type Counts = { visits: number; clicks: number; likes: number }

const SEEN = 'yx-visited'

function seen(): boolean {
  try {
    if (sessionStorage.getItem(SEEN)) return true
    sessionStorage.setItem(SEEN, '1')
    return false
  } catch {
    return false /* private mode etc. — count it, worst case is a dupe */
  }
}

const returning = seen()

export const counts: Promise<Counts | null> = fetch(
  returning ? '/api/hits' : '/api/hits?k=visit',
  returning ? undefined : { method: 'POST' },
)
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null)

let pendingClicks = 0
let pendingLikes = 0
let likeTimer: ReturnType<typeof setTimeout> | undefined

function flush() {
  if (pendingClicks) {
    navigator.sendBeacon(`/api/hits?k=click&n=${pendingClicks}`)
    pendingClicks = 0
  }
  /* the api caps a batch at 200, so absurd mashing drains in chunks */
  while (pendingLikes > 0) {
    const n = Math.min(pendingLikes, 200)
    pendingLikes -= n
    navigator.sendBeacon(`/api/hits?k=like&n=${n}`)
  }
}

/* spammable on purpose — every mash counts. likes settle for 900ms, then
   the whole burst ships as one beacon. */
export function addLike() {
  pendingLikes++
  clearTimeout(likeTimer)
  likeTimer = setTimeout(flush, 900)
}

export function trackClicks() {
  addEventListener('click', () => void pendingClicks++, { capture: true, passive: true })
  addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
