import React from 'react'
import { createPortal } from 'react-dom'
import type { LearnInfo } from '../core/types'
import { translate, escapeHtml } from '../core/utils'

interface LearnPopupProps {
  learns: LearnInfo[]
  routeStr: string
  translateFn?: (text: string) => string
  onStart: (learnName: string) => void
  onDismiss: (learnName: string) => void
  onSnooze: (route: string) => void
}

export function LearnPopup({
  learns,
  routeStr,
  translateFn,
  onStart,
  onDismiss,
  onSnooze,
}: LearnPopupProps) {
  const __ = (t: string) => translate(t, translateFn)

  if (!learns.length) return null

  const MAX_VISIBLE = 2
  const matchNames = learns.map((l) => l.name)

  const title =
    learns.length > 1
      ? __('Formations disponibles') + ` (${learns.length})`
      : __('Formation disponible')

  const popup = (
    <div id="nora-assist-panel">
      <div className="nora-assist-card" role="status">
        {/* Header */}
        <div className="nora-assist-header">
          <div className="nora-assist-header-left">
            <span className="nora-assist-indicator" />
            <span className="nora-assist-title">{title}</span>
          </div>
          <button
            className="nora-assist-close"
            title={__('Plus tard')}
            onClick={() => onSnooze(routeStr)}
          >
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="nora-assist-items">
          {learns.map((learn, idx) => {
            const isHidden = idx >= MAX_VISIBLE
            const hasUnmetPrereq = (learn.prerequisites || []).some((p) => matchNames.includes(p))
            const btnLabel = learn.in_progress ? __('Reprendre') : __('Commencer')

            return (
              <div
                key={learn.name}
                className={`nora-assist-item${hasUnmetPrereq ? ' nora-assist-item-disabled' : ''}${isHidden ? ' nora-assist-item-overflow' : ''}`}
                data-learn={learn.name}
                style={isHidden ? { display: 'none' } : undefined}
              >
                <div className="nora-assist-item-row">
                  <div className="nora-assist-item-info">
                    <span className="nora-assist-item-title">{escapeHtml(learn.title)}</span>
                    <span className="nora-assist-item-meta">
                      {learn.in_progress && (
                        <span className="nora-assist-item-badge">{__('En cours')}</span>
                      )}
                      {learn.estimated_duration && (
                        <span className="nora-assist-item-duration">
                          {learn.estimated_duration} min
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    className="nora-assist-dismiss-one"
                    title={__('Ne plus proposer')}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDismiss(learn.name)
                    }}
                  >
                    &times;
                  </button>
                </div>
                {hasUnmetPrereq && learn.prerequisite_titles?.length > 0 && (
                  <div className="nora-assist-item-prereq">
                    {__("Faire d'abord")} :{' '}
                    {learn.prerequisite_titles.map((p) => (
                      <em key={p.name}>{escapeHtml(p.title)}</em>
                    ))}
                  </div>
                )}
                <div className="nora-assist-item-actions">
                  {hasUnmetPrereq ? (
                    <button className="btn btn-xs btn-default" disabled>
                      {__('Commencer')}
                    </button>
                  ) : (
                    <button
                      className="btn btn-xs btn-primary nora-assist-start"
                      onClick={() => onStart(learn.name)}
                    >
                      {btnLabel}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="nora-assist-footer">
          <button
            className="btn btn-xs btn-default nora-assist-snooze"
            onClick={() => onSnooze(routeStr)}
          >
            {__('Plus tard')}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(popup, document.body)
}
