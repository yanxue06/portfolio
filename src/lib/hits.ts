/* the site's own hit counter — one visit per browser session (refreshes
   don't inflate it), clicks batched and flushed when the page hides so the
   whole thing costs one request per session. plain `bun run dev` has no
   /api, so everything degrades to null silently. */

export type Counts = { visits: number; clicks: number }

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

function flush() {
  if (!pendingClicks) return
  navigator.sendBeacon(`/api/hits?k=click&n=${pendingClicks}`)
  pendingClicks = 0
}

export function trackClicks() {
  addEventListener('click', () => void pendingClicks++, { capture: true, passive: true })
  addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
