import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { StepData } from '../core/types'
import { renderMarkdown, translate } from '../core/utils'

interface StepPopoverProps {
  element: HTMLElement | null
  step: StepData
  stepIndex: number
  totalSteps: number
  translateFn?: (text: string) => string
}

export function StepPopover({ element, step, stepIndex, totalSteps, translateFn }: StepPopoverProps) {
  const __ = (t: string) => translate(t, translateFn)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!popRef.current || !element) return
    positionPopover(popRef.current, element)
  }, [element, step])

  if (!element) return null

  const badge = `${__('Step')} ${stepIndex + 1}/${totalSteps}`

  const popover = (
    <div ref={popRef} id="nora-step-popover" className="nora-pop-bottom">
      <div className="nora-pop-arrow" />
      <div className="nora-pop-badge">{badge}</div>
      <div
        className="nora-pop-text"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(step.explanation || '') }}
      />
    </div>
  )

  return createPortal(popover, document.body)
}

function positionPopover(pop: HTMLElement, element: HTMLElement): void {
  const rect = element.getBoundingClientRect()
  const gap = 12
  const vpW = window.innerWidth
  const vpH = window.innerHeight

  const isLarge = rect.height > 200
  const refTop = rect.top
  const refBottom = isLarge ? Math.min(rect.top + 80, rect.bottom) : rect.bottom

  pop.classList.remove('nora-pop-top', 'nora-pop-bottom', 'nora-pop-left', 'nora-pop-right')

  let top: number
  let left: number
  let posClass: string

  const spaceAbove = refTop
  const spaceBelow = vpH - refBottom
  const spaceRight = vpW - rect.right

  const isInput = element.matches('input, textarea, select, [contenteditable]') ||
    !!element.closest('.frappe-control')?.querySelector('input, select')

  if (isInput && spaceRight >= 300) {
    top = rect.top
    left = rect.right + gap
    posClass = 'nora-pop-right'
  } else if (spaceBelow >= 180) {
    top = refBottom + gap
    left = rect.left
    posClass = 'nora-pop-bottom'
  } else if (spaceRight >= 450) {
    top = refTop
    left = rect.right + gap
    posClass = 'nora-pop-right'
  } else if (spaceAbove >= 150) {
    top = refTop - gap
    left = rect.left + rect.width / 2 - 210
    posClass = 'nora-pop-top'
  } else {
    top = refBottom + gap
    left = rect.left + rect.width / 2 - 210
    posClass = 'nora-pop-bottom'
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, vpW - 440))
  top = Math.max(8, Math.min(top, vpH - 100))

  pop.classList.add(posClass)
  if (posClass === 'nora-pop-top') {
    pop.style.cssText = `position:fixed;bottom:${vpH - top}px;left:${left}px;`
  } else {
    pop.style.cssText = `position:fixed;top:${top}px;left:${left}px;`
  }
}
