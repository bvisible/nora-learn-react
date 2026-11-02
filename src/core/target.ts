/**
 * What a tutorial points at and waits for, read by the file the site serves: the words of a tutorial and the code that
 * reads them come from the same place (nora/public/js/nora_learn_target.js). It holds no code: a condition is data.
 */
const SOURCE = '/assets/nora/js/nora_learn_target.js'

interface LearnTarget {
  all(root: Element | Document, target: unknown): Element[]
  holds(condition: unknown): boolean
}

let loading: Promise<void> | null = null

function module(): LearnTarget | undefined {
  return (window as unknown as { nora?: { learn_target?: LearnTarget } }).nora?.learn_target
}

/** Load it once, before a tutorial starts. Unreachable, targets find nothing and conditions are false. */
export function loadTarget(): Promise<void> {
  if (module()) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = SOURCE
      script.onload = () => resolve()
      script.onerror = () => {
        loading = null
        resolve()
      }
      document.head.appendChild(script)
    })
  }
  return loading
}

export function holds(condition: unknown): boolean {
  return module()?.holds(condition) ?? false
}

export function allOf(root: Element | Document, target: unknown): Element[] {
  return module()?.all(root, target) ?? []
}
