import { Suspense, lazy, type ReactElement } from 'react'

/**
 * Split point for the documentation, for the same reason the marketing route
 * has one: it is a long page of prose that nobody opening `/app` needs in
 * their bundle.
 */
const Docs = lazy(async () => ({ default: (await import('./Docs')).Docs }))

export function DocsRoute(): ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <Docs />
    </Suspense>
  )
}
