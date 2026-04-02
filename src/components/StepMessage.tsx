import React, { useEffect, useRef } from 'react'
import type { StepMessageData } from '../core/types'
import { renderMarkdown, translate } from '../core/utils'

interface StepMessageProps {
  data: StepMessageData
  onDoIt?: () => void
  onContinue?: () => void
  onValidationFail?: (message: string) => void
  validationRule?: string
  validationErrorMessage?: string
  translateFn?: (text: string) => string
}

export function StepMessage({
  data,
  onDoIt,
  onContinue,
  onValidationFail,
  validationRule,
  validationErrorMessage,
  translateFn,
}: StepMessageProps) {
  const __ = (t: string) => translate(t, translateFn)
  const buttonsRef = useRef<HTMLDivElement>(null)

  const actionableTypes = ['click', 'navigate', 'set_value', 'submit_form']
  const showDoIt = data.has_execute_actions && actionableTypes.includes(data.action_type)
  const showContinue = !data.has_wait_condition || data.is_checkpoint

  // Reveal buttons after 2s
  useEffect(() => {
    const el = buttonsRef.current
    if (!el) return
    const timer = setTimeout(() => {
      el.classList.remove('nora-ls-buttons-hidden')
    }, 2000)
    return () => clearTimeout(timer)
  }, [data.step_index])

  const handleContinue = () => {
    if (validationRule) {
      try {
        if (!new Function(`return !!(${validationRule})`)()) {
          onValidationFail?.(validationErrorMessage || __('Please complete this step first.'))
          return
        }
      } catch { /* rule not evaluable, let pass */ }
    }
    onContinue?.()
  }

  return (
    <div className="nora-ls-step-message" style={{ animation: 'nora-lp-fadeIn 0.3s ease' }}>
      <div className="nora-ls-step-badge">
        {__('Step')} {data.step_index + 1}/{data.total_steps}
      </div>
      <div
        className="nora-ls-step-text"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(data.explanation) }}
      />
      {(showDoIt || showContinue) && (
        <div ref={buttonsRef} className="nora-ls-step-buttons nora-ls-buttons-hidden">
          {showDoIt && (
            <button className="nora-ls-btn nora-ls-do-it" onClick={onDoIt}>
              {__('Do it for me')}
            </button>
          )}
          {showContinue && (
            <button className="nora-ls-btn nora-ls-continue" onClick={handleContinue}>
              {__('Continue')} ▸
            </button>
          )}
        </div>
      )}
    </div>
  )
}
