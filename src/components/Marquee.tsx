const ITEMS = ['rust', 'typescript', 'ci/cd', 'dev tools', 'frisbee', 'guitar', 'chess']

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {Array.from({ length: 4 }).flatMap((_, rep) =>
        ITEMS.map((item) => (
          <span key={`${rep}-${item}`} className="muted flex items-center font-mono text-[13px]">
            <span className="whitespace-nowrap">{item}</span>
            <span className="mx-6 text-gold">·</span>
          </span>
        )),
      )}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="hairline overflow-hidden border-y py-3">
      <div className="marquee-track flex w-max">
        <Track />
        <Track hidden />
      </div>
    </div>
  )
}
