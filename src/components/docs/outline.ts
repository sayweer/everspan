/**
 * The table of contents. Kept beside the content rather than inside it so the
 * sidebar, the mobile section picker and the scroll-spy all read one list, and
 * so a section can never appear in the nav without existing on the page.
 *
 * Order here is the order on the page — `DocsBody` walks the same list.
 */
export interface DocsSectionMeta {
  /** Anchor. Deep links from the landing page and the app point at these. */
  readonly id: string
  readonly title: string
  /** Sits under the title, and is what the nav shows on a wide screen. */
  readonly lede: string
}

export const DOCS_SECTIONS: readonly DocsSectionMeta[] = [
  {
    id: 'overview',
    title: 'What Everspan is',
    lede: 'A fixed-income protocol for Stellar: it separates what a deposit returns from what it earns, and gives each part its own market.',
  },
  {
    id: 'protocol',
    title: 'Protocol',
    lede: 'Standardized Yield, the two positions a deposit becomes, the four operations that move between them, and how yield is accounted for.',
  },
  {
    id: 'markets',
    title: 'Markets and pricing',
    lede: 'Where a fixed rate actually comes from: one constant-product pool per maturity, and the discount a principal position trades at.',
  },
  {
    id: 'app',
    title: 'Using the app',
    lede: 'From connecting an account to redeeming a matured position, step by step, with what each number on screen means.',
  },
  {
    id: 'security',
    title: 'Security',
    lede: 'Who can touch what. The custody model, the complete list of admin powers, and the things Everspan deliberately cannot do.',
  },
  {
    id: 'contracts',
    title: 'Contracts',
    lede: 'The seven Soroban crates, what each one is responsible for, and the live Testnet address of every deployed contract.',
  },
  {
    id: 'troubleshooting',
    title: 'Errors and troubleshooting',
    lede: 'Every failure the app can show you, what actually caused it, and what to do next.',
  },
  { id: 'faq', title: 'FAQ', lede: 'The questions that come up most often, answered directly.' },
  {
    id: 'glossary',
    title: 'Glossary',
    lede: 'Every term this documentation uses, in one place.',
  },
  {
    id: 'resources',
    title: 'Resources',
    lede: 'Source code, the deep technical documents, the demo, and the upstream projects Everspan builds on.',
  },
]
