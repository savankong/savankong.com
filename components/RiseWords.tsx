import { Fragment } from 'react'

/** Splits a line into words that rise into place one after another. */
export default function RiseWords({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return (
    <span className="rise-words" aria-label={text}>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span className={className} style={{ '--i': i + start } as React.CSSProperties}>{word}</span>
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}
