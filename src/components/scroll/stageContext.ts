import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../../lib/gsap'

/* ─────────────────────────────────────────────────────────
 * SCROLL STAGE — shared contract
 *
 * Context, geometry and paint helpers for `ScrollStage`/`ScrollScene`.
 * Kept out of the component files so both can import from one place without
 * breaking fast refresh.
 * ───────────────────────────────────────────────────────── */

/** Viewport heights of scroll one panel entrance consumes at `length={1}`. */
export const SCENE_LENGTH_VH = 1
/** Viewport heights the final panel holds before the stage unpins. */
export const TAIL_VH = 0.6

/**
 * Fraction of a `length={1}` segment spent on the entrance. The remainder is
 * dwell: the panel holds, settled, before the next one starts covering it.
 * Without this a panel is complete only for the instant before it is replaced.
 */
const ENTRANCE_FRACTION = 0.62

/** Fraction of a scene's entrance spent un-clipping, before it expands. */
const REVEAL_SPLIT = 0.72
const GUTTER_PX = 24
const RADIUS_PX = 20
/** How far the outgoing layer recedes while the next one covers it. */
const RECEDE_SCALE = 0.97
const RECEDE_DIM = 0.55
/** Distance a scene's content travels as it settles into place. */
const CONTENT_RISE_PX = 56
/**
 * Content waits for most of the wipe before appearing. Without this the
 * headline is sliced in half by the advancing edge and briefly collides with
 * the outgoing scene's headline behind it.
 */
const CONTENT_SETTLE_FROM = 0.3
const CONTENT_SETTLE_TO = 0.78

export type SceneRegistration = {
  element: HTMLElement
  content: HTMLElement
  dim: HTMLElement
  length: number
  /**
   * The scene paints itself from `useSceneProgress` instead of receiving the
   * default card wipe. Used by the opening, which zooms rather than wipes.
   */
  custom: boolean
}

export type StageApi = {
  pinned: boolean
  /** The measured height every scene is laid out in. See `measureStageHeight`. */
  stageHeight: number
  register(index: number, registration: SceneRegistration): () => void
  subscribe(index: number, listener: (progress: number) => void): () => void
  scrollToScene(index: number): void
}

export const StageContext = createContext<StageApi | null>(null)
export const SceneIndexContext = createContext(0)

/** The one condition the stage runs under: the reader accepts motion. */
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

export function pinningSuits(): boolean {
  return window.matchMedia(MOTION_QUERY).matches
}

/**
 * The height the whole stage is measured against — the track's length, each
 * segment's share of it, and the pinned box itself all come from this one
 * number, so they can never disagree.
 *
 * It is a measurement rather than a `vh` unit because on a phone the two are
 * not the same quantity: `vh` is the viewport with the browser's chrome
 * hidden, while `innerHeight` is whatever is on screen right now. Mixing them
 * left every scene finishing before the track did.
 */
export function measureStageHeight(): number {
  return window.innerHeight
}

/**
 * Whether a resize is real or is just a phone's chrome sliding away. Mirrors
 * ScrollTrigger's own rule for touch-only devices (a width change, or a height
 * change past a quarter of the viewport) so our geometry and its refreshes
 * agree about what counts as a resize — otherwise the stage would re-measure
 * on a scroll that GSAP deliberately ignored, and every layer would jump.
 */
export function stageResized(previous: { width: number; height: number }): boolean {
  if (window.innerWidth !== previous.width) return true
  if (ScrollTrigger.isTouch === 1) {
    return Math.abs(window.innerHeight - previous.height) > window.innerHeight * 0.25
  }
  return window.innerHeight !== previous.height
}

export function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Scroll offset, in pixels from the top of the track, where scene `index`
 * begins. Scene 0 owns a segment too — it is the opening, which animates in
 * place rather than entering over something.
 */
export function segmentStartPx(
  lengths: Record<number, number>,
  index: number,
  stageHeight: number,
): number {
  let vh = 0
  for (let i = 0; i < index; i += 1) vh += (lengths[i] ?? 1) * SCENE_LENGTH_VH
  return vh * stageHeight
}

export function segmentLengthPx(
  lengths: Record<number, number>,
  index: number,
  stageHeight: number,
): number {
  return (lengths[index] ?? 1) * SCENE_LENGTH_VH * stageHeight
}

export function trackHeightVh(lengths: Record<number, number>, sceneCount: number): number {
  let vh = TAIL_VH
  for (let index = 0; index < sceneCount; index += 1) vh += (lengths[index] ?? 1) * SCENE_LENGTH_VH
  return vh * 100
}

/**
 * The clip-path a pinned scene shows before GSAP has painted anything —
 * matches what `paintEntrance` computes at progress 0. Scene 0 needs none — it
 * is meant to be visible by default — but every other scene needs to already
 * be closed: the alternative (no clip-path at all) leaves every layer fully
 * opaque, and the highest `zIndex` — the last scene — sits on top of the
 * stack, exposing the wrong scene until GSAP's first paint. Setting this as a
 * plain render-time style closes that gap: it is correct from the very first
 * frame, GSAP overwrites it with the identical value once it takes over, and
 * nothing changes hands on that transition.
 */
export function initialClipPath(index: number): string | undefined {
  if (index === 0) return undefined
  return `inset(100% ${GUTTER_PX}px ${GUTTER_PX}px ${GUTTER_PX}px round ${RADIUS_PX}px)`
}

/**
 * Paints one layer for a given entrance progress. Called from a scrubbed tween,
 * so it runs on every scroll frame and must only touch compositor-friendly
 * properties (`clip-path`, `transform`, `opacity`).
 */
export function paintEntrance(scene: SceneRegistration, rawProgress: number): void {
  // A scene's entrance always costs the same scroll distance; a `length` above
  // 1 buys dwell time on the far side, not a slower wipe.
  const progress = clamp01(rawProgress / entranceSpan(scene))
  const reveal = clamp01(progress / REVEAL_SPLIT)
  const expand = clamp01((progress - REVEAL_SPLIT) / (1 - REVEAL_SPLIT))
  const gutter = GUTTER_PX * (1 - expand)
  const radius = RADIUS_PX * (1 - expand)

  scene.element.style.clipPath = `inset(${(1 - reveal) * 100}% ${gutter}px ${gutter}px ${gutter}px round ${radius}px)`

  const settle = clamp01(
    (progress - CONTENT_SETTLE_FROM) / (CONTENT_SETTLE_TO - CONTENT_SETTLE_FROM),
  )
  scene.content.style.opacity = String(settle)
  scene.content.style.transform = `translate3d(0, ${CONTENT_RISE_PX * (1 - settle)}px, 0)`
}

/**
 * How far a scene is through its dwell — the scroll it holds after its entrance
 * finishes. Always 0 while the scene is still wiping in, so multi-step visuals
 * start from the beginning once the scene is actually on screen.
 */
export function dwellProgress(scene: SceneRegistration, rawProgress: number): number {
  const entrance = entranceSpan(scene)
  return clamp01((rawProgress - entrance) / (1 - entrance))
}

/** Fraction of this scene's segment its entrance occupies. */
function entranceSpan(scene: SceneRegistration): number {
  return Math.min(1, ENTRANCE_FRACTION / Math.max(1, scene.length))
}

/** Paints the layer being covered: it settles back instead of sitting flat. */
export function paintRecede(scene: SceneRegistration, progress: number): void {
  scene.element.style.transform = `scale(${1 - (1 - RECEDE_SCALE) * progress})`
  scene.dim.style.opacity = String(RECEDE_DIM * progress)
  // A transparent full-screen layer still costs the compositor on every frame.
  scene.dim.style.visibility = progress > 0 ? 'visible' : 'hidden'
}

export function resetScene(scene: SceneRegistration): void {
  scene.element.style.clipPath = ''
  scene.element.style.transform = ''
  scene.content.style.transform = ''
  scene.content.style.opacity = ''
  scene.dim.style.opacity = '0'
  scene.dim.style.visibility = 'hidden'
}

export function useStage(): StageApi | null {
  return useContext(StageContext)
}

export function useSceneIndex(): number {
  return useContext(SceneIndexContext)
}

/**
 * Subscribes to this scene's dwell progress (0 → 1, see `dwellProgress`). The
 * listener runs on every scroll frame, so it should write to the DOM directly
 * rather than call `setState`. For discrete state, use `useSceneStep`.
 */
export function useSceneProgress(listener: (progress: number) => void): void {
  const stage = useStage()
  const index = useSceneIndex()
  const stable = useRef(listener)

  useEffect(() => {
    stable.current = listener
  })

  useEffect(() => {
    if (!stage?.pinned) return
    return stage.subscribe(index, (progress) => stable.current(progress))
  }, [index, stage])
}

/**
 * Buckets this scene's dwell into `count` steps, re-rendering only when the
 * bucket changes. Give such a scene a `length` above 1 so each step gets a
 * comfortable amount of scroll.
 */
export function useSceneStep(count: number): number {
  const [step, setStep] = useState(0)

  useSceneProgress((dwell) => {
    setStep(Math.min(count - 1, Math.floor(dwell * count)))
  })

  return step
}
