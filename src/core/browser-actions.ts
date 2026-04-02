import type { BrowserAction, HighlightAction } from './types'
import { sleep } from './utils'

// Track highlighted element for cleanup
let _highlightedElement: HTMLElement | null = null

/**
 * Execute a highlight action on a DOM element
 */
export function highlight(element: HTMLElement, options?: Record<string, unknown>): void {
  removeHighlight()

  const color = (options?.glow as string) || '#7c3aed'
  const persistent = options?.persistent !== false

  // Save original styles
  ;(element as HTMLElement & { _noraOriginalStyles?: Record<string, string> })._noraOriginalStyles = {
    outline: element.style.outline,
    boxShadow: element.style.boxShadow,
    animation: element.style.animation,
  }

  // Apply highlight
  element.style.outline = `2px solid ${color}`
  element.style.boxShadow = `0 0 12px 4px ${color}40, 0 0 24px 8px ${color}20`
  element.style.animation = 'nora-highlight-pulse 1.5s ease-in-out infinite'

  // Inject keyframe if not present
  if (!document.getElementById('nora-highlight-keyframes')) {
    const style = document.createElement('style')
    style.id = 'nora-highlight-keyframes'
    style.textContent = `
      @keyframes nora-highlight-pulse {
        0%, 100% { box-shadow: 0 0 12px 4px ${color}40, 0 0 24px 8px ${color}20; }
        50% { box-shadow: 0 0 18px 6px ${color}60, 0 0 36px 12px ${color}30; }
      }
    `
    document.head.appendChild(style)
  }

  _highlightedElement = element
  ;(element as HTMLElement & { _noraHighlighted?: boolean })._noraHighlighted = true

  if (!persistent) {
    setTimeout(() => removeHighlight(), (options?.duration as number) || 3000)
  }
}

/**
 * Remove all Nora highlights from the page
 */
export function removeHighlight(): void {
  if (_highlightedElement) {
    const el = _highlightedElement as HTMLElement & { _noraOriginalStyles?: Record<string, string> }
    if (el._noraOriginalStyles) {
      el.style.outline = el._noraOriginalStyles.outline || ''
      el.style.boxShadow = el._noraOriginalStyles.boxShadow || ''
      el.style.animation = el._noraOriginalStyles.animation || ''
      el._noraOriginalStyles = undefined
    }
    ;(el as HTMLElement & { _noraHighlighted?: boolean })._noraHighlighted = false
    _highlightedElement = null
  }

  // Also clean up any orphaned highlights
  document.querySelectorAll('[style*="nora-highlight-pulse"]').forEach((el) => {
    const htmlEl = el as HTMLElement & { _noraOriginalStyles?: Record<string, string> }
    if (htmlEl._noraOriginalStyles) {
      htmlEl.style.outline = htmlEl._noraOriginalStyles.outline || ''
      htmlEl.style.boxShadow = htmlEl._noraOriginalStyles.boxShadow || ''
      htmlEl.style.animation = htmlEl._noraOriginalStyles.animation || ''
      htmlEl._noraOriginalStyles = undefined
    } else {
      ;(el as HTMLElement).style.outline = ''
      ;(el as HTMLElement).style.boxShadow = ''
      ;(el as HTMLElement).style.animation = ''
    }
  })
}

/**
 * Find a visible element by CSS selector, with :contains() support
 */
export function findVisibleElement(selector: string): HTMLElement | null {
  const isVisible = (el: Element): el is HTMLElement => {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  }

  // :contains() support
  const parseContains = (sel: string) => {
    const m = sel.match(/:contains\(['"]?([^'")\]]+)['"]?\)/)
    if (!m) return null
    return { base: sel.replace(/:contains\(['"]?[^'")\]]+['"]?\)/, '').trim() || '*', text: m[1].toLowerCase() }
  }

  const queryAll = (root: Element | Document, sel: string): Element[] => {
    if (sel.includes(':contains(') && sel.includes(',')) {
      const results: Element[] = []
      const parts = sel.split(/,(?![^(]*\))/)
      for (const part of parts) {
        const trimmed = part.trim()
        if (!trimmed) continue
        const parsed = parseContains(trimmed)
        if (parsed) {
          try {
            results.push(...Array.from(root.querySelectorAll(parsed.base)).filter((el) =>
              el.textContent?.toLowerCase().includes(parsed.text)
            ))
          } catch { /* invalid selector */ }
        } else {
          try { results.push(...Array.from(root.querySelectorAll(trimmed))) } catch { /* ignore */ }
        }
      }
      return results
    }
    const parsed = parseContains(sel)
    if (parsed) {
      return Array.from(root.querySelectorAll(parsed.base)).filter((el) =>
        el.textContent?.toLowerCase().includes(parsed.text)
      )
    }
    try { return Array.from(root.querySelectorAll(sel)) } catch { return [] }
  }

  // 1. If modal is open, search inside it first
  const modal = document.querySelector('.modal.show, .modal.in') as HTMLElement | null
  if (modal) {
    for (const el of queryAll(modal, selector)) {
      if (isVisible(el)) return el
    }
    // Try data-fieldname inside modal
    try {
      for (const el of modal.querySelectorAll(`[data-fieldname="${selector}"]`)) {
        if (isVisible(el)) return el
      }
    } catch { /* ignore */ }
  }

  // 2. Try as CSS selector in document
  for (const el of queryAll(document, selector)) {
    if (isVisible(el)) return el
  }

  // 3. Try as data-fieldname attribute
  try {
    for (const el of document.querySelectorAll(`[data-fieldname="${selector}"]`)) {
      if (isVisible(el)) return el
    }
  } catch { /* ignore */ }

  return null
}

/**
 * Execute a single browser action
 */
export async function executeAction(action: BrowserAction): Promise<void> {
  switch (action.action) {
    case 'navigate':
      if (action.url) {
        window.location.href = action.url
      }
      break

    case 'click': {
      const el = action.selector ? findVisibleElement(action.selector) : null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(200)
        el.click()
      }
      break
    }

    case 'set_value': {
      const el = action.selector
        ? findVisibleElement(action.selector)
        : action.fieldname
          ? findVisibleElement(`[data-fieldname="${action.fieldname}"]`)
          : null
      if (el) {
        const input = el.matches('input, textarea, select')
          ? el as HTMLInputElement
          : el.querySelector('input, textarea, select') as HTMLInputElement | null
        if (input) {
          // Use native value setter to trigger React/Frappe change detection
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, action.value || '')
          } else {
            input.value = action.value || ''
          }
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
      break
    }

    case 'highlight': {
      const el = action.selector ? findVisibleElement(action.selector) : null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(200)
        highlight(el, action.options as Record<string, unknown>)
      }
      break
    }

    case 'scroll': {
      const el = action.selector ? findVisibleElement(action.selector) : null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      break
    }

    case 'focus': {
      const el = action.selector ? findVisibleElement(action.selector) : null
      if (el) {
        el.focus()
      }
      break
    }
  }
}

/**
 * Execute multiple browser actions in sequence
 */
export async function executeMany(actions: BrowserAction[]): Promise<void> {
  for (const action of actions) {
    await executeAction(action)
    await sleep(300)
  }
}

/**
 * Execute highlight actions from a step
 */
export async function executeHighlightActions(actions: HighlightAction[]): Promise<HTMLElement | null> {
  let targetEl: HTMLElement | null = null
  for (const action of actions) {
    if (action.selector) {
      const el = findVisibleElement(action.selector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(200)
        highlight(el, action.options as Record<string, unknown>)
        if (!targetEl) targetEl = el
      }
    }
  }
  return targetEl
}
