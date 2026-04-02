import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import type { StepData, StepMessageData } from '../core/types'
import { translate, escapeHtml } from '../core/utils'
import { StepMessage } from './StepMessage'
import { ChatArea } from './ChatArea'

interface LearnSidebarProps {
  isOpen: boolean
  title: string
  learnName: string
  stepIndex: number
  totalSteps: number
  currentStep: StepData | null
  highlightRect: DOMRect | null
  isCompleted: boolean
  nextLearn?: string
  nextLearnTitle?: string
  noraIconUrl?: string
  translateFn?: (text: string) => string
  onClose: () => void
  onFinish: () => void
  onRestart: () => void
  onDoIt: () => void
  onContinue: () => void
  onNextLearn?: (name: string) => void
  onValidationFail?: (message: string) => void
}

export function LearnSidebar({
  isOpen,
  title,
  learnName,
  stepIndex,
  totalSteps,
  currentStep,
  highlightRect,
  isCompleted,
  nextLearn,
  nextLearnTitle,
  noraIconUrl = '/assets/nora/images/nora_icon.svg',
  translateFn,
  onClose,
  onFinish,
  onRestart,
  onDoIt,
  onContinue,
  onNextLearn,
  onValidationFail,
}: LearnSidebarProps) {
  const __ = (t: string) => translate(t, translateFn)
  const [chatExpanded, setChatExpanded] = useState(false)

  if (!isOpen) return null

  const pos = computePosition(highlightRect)
  const progress = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0

  const stepMessageData: StepMessageData | null = currentStep
    ? {
        step_index: stepIndex,
        total_steps: totalSteps,
        explanation: currentStep.explanation || '',
        action_type: currentStep.action_type,
        is_checkpoint: currentStep.is_checkpoint,
        has_execute_actions: !!(currentStep.execute_actions?.length),
        has_wait_condition: !!currentStep.wait_condition,
      }
    : null

  const sidebar = (
    <div
      className={`nora-lp nora-lp-${pos.h} nora-lp-${pos.v}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="nora-lp-header">
        <img className="nora-lp-icon" src={noraIconUrl} alt="NORA" />
        <div className="nora-lp-header-text">
          <span className="nora-lp-title">{escapeHtml(title)}</span>
          <span className="nora-lp-step">
            {__('Step')} {stepIndex + 1}/{totalSteps}
          </span>
        </div>
        <div className="nora-lp-header-actions">
          <button className="nora-lp-btn" title={__('Restart')} onClick={onRestart}>↺</button>
          <button className="nora-lp-btn" title={__('Finish')} onClick={onFinish}>✓</button>
          <button className="nora-lp-btn close-popup" title={__('Close')} onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="nora-lp-progress">
        <div className="nora-lp-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Messages area */}
      <div className="nora-lp-messages">
        {isCompleted ? (
          <CompletionMessage
            __={__}
            nextLearn={nextLearn}
            nextLearnTitle={nextLearnTitle}
            onNextLearn={onNextLearn}
            onClose={onClose}
            noraIconUrl={noraIconUrl}
          />
        ) : stepMessageData ? (
          <StepMessage
            data={stepMessageData}
            onDoIt={onDoIt}
            onContinue={onContinue}
            onValidationFail={onValidationFail}
            validationRule={currentStep?.validation_rule}
            validationErrorMessage={currentStep?.on_error_message}
            translateFn={translateFn}
          />
        ) : null}
      </div>

      {/* Chat toggle — exact same as original */}
      {!isCompleted && (
        <div className="nora-lp-chat-toggle">
          <button
            className="nora-lp-btn nora-lp-chat-btn"
            onClick={(e) => { e.stopPropagation(); setChatExpanded(!chatExpanded) }}
          >
            {chatExpanded ? __('Hide chat') + ' \u2715' : __('Ask NORA') + ' \uD83D\uDCAC'}
          </button>
        </div>
      )}

      {/* Chat area */}
      {!isCompleted && (
        <ChatArea
          isExpanded={chatExpanded}
          learnName={learnName}
          learnTitle={title}
          currentStep={currentStep}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          noraIconUrl={noraIconUrl}
          translateFn={translateFn}
        />
      )}
    </div>
  )

  return createPortal(sidebar, document.body)
}

// ========== Completion message ==========

function CompletionMessage({
  __,
  nextLearn,
  nextLearnTitle,
  onNextLearn,
  onClose,
  noraIconUrl,
}: {
  __: (t: string) => string
  nextLearn?: string
  nextLearnTitle?: string
  onNextLearn?: (name: string) => void
  onClose: () => void
  noraIconUrl: string
}) {
  return (
    <>
      <div className="nora-ls-message nora-ls-message-bot">
        <div className="nora-ls-avatar nora-ls-avatar-bot">
          <img src={noraIconUrl} alt="NORA" />
        </div>
        <div className="nora-ls-message-content">
          {'\uD83C\uDF89'} {__('Congratulations! You have completed this learn.')}
        </div>
      </div>
      {nextLearn && onNextLearn && (
        <div style={{ marginTop: 10 }}>
          <strong>{__('Next recommended learn:')}</strong>
          <br />
          <button
            className="nora-ls-btn nora-ls-continue"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => onNextLearn(nextLearn)}
          >
            {nextLearnTitle || nextLearn} ▸
          </button>
          <button
            className="nora-ls-btn"
            style={{ marginTop: 6, width: '100%', background: 'rgba(0,0,0,0.05)', color: '#64748b' }}
            onClick={onClose}
          >
            {__('Close')}
          </button>
        </div>
      )}
    </>
  )
}

// ========== Position computation ==========

function computePosition(targetRect: DOMRect | null): { h: 'left' | 'right'; v: 'top' | 'bottom' } {
  if (!targetRect) return { h: 'left', v: 'bottom' }

  const vpW = window.innerWidth
  const vpH = window.innerHeight
  const cx = targetRect.left + targetRect.width / 2
  const cy = targetRect.top + targetRect.height / 2

  return {
    h: cx < vpW / 2 ? 'right' : 'left',
    v: cy > vpH / 2 ? 'top' : 'bottom',
  }
}
