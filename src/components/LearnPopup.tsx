import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import type { LearnInfo } from '../core/types'
import { translate, escapeHtml } from '../core/utils'

interface LearnPopupProps {
  learns: LearnInfo[]
  routeStr: string
  translateFn?: (text: string) => string
  onStart: (learnName: string) => void
  onSnooze: (route: string, scope: 'page' | 'all', hours: number) => void
}

const DURATIONS = [
  { hours: 1, label: '1h' },
  { hours: 4, label: '4h' },
  { hours: 24, label: '24h' },
  { hours: 168, labelKey: '1 sem.' },
]

export function LearnPopup({
  learns,
  routeStr,
  translateFn,
  onStart,
  onSnooze,
}: LearnPopupProps) {
  const __ = (t: string) => translate(t, translateFn)

  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [snoozeScope, setSnoozeScope] = useState<'page' | 'all'>('page')
  const [snoozeInfoText, setSnoozeInfoText] = useState(__('Réapparaîtra dans 24h'))

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
        {/* Header — no close button */}
        <div className="nora-assist-header">
          <div className="nora-assist-header-left">
            <span className="nora-assist-indicator" />
            <span className="nora-assist-title">{title}</span>
          </div>
        </div>

        {/* Items — compact layout: title+meta left, button right */}
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
                  <div className="nora-assist-item-right">
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
                {hasUnmetPrereq && learn.prerequisite_titles?.length > 0 && (
                  <div className="nora-assist-item-prereq">
                    {__("Faire d'abord")} :{' '}
                    {learn.prerequisite_titles.map((p) => (
                      <em key={p.name}>{escapeHtml(p.title)}</em>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer — dark "Plus tard" button */}
        <div className="nora-assist-footer">
          <button
            className="nora-assist-later-btn"
            onClick={() => setSnoozeOpen((prev) => !prev)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{__('Plus tard')}</span>
          </button>
        </div>

        {/* Snooze panel — scope + duration */}
        <div className={`nora-assist-snooze-panel${snoozeOpen ? ' nora-assist-snooze-panel-open' : ''}`}>
          <div className="nora-assist-snooze-label">{__('Rappeler plus tard')}</div>
          <div className="nora-assist-snooze-scope">
            <button
              className={`nora-assist-scope-btn${snoozeScope === 'page' ? ' active' : ''}`}
              onClick={() => setSnoozeScope('page')}
            >
              {__('Cette page')}
            </button>
            <button
              className={`nora-assist-scope-btn${snoozeScope === 'all' ? ' active' : ''}`}
              onClick={() => setSnoozeScope('all')}
            >
              {__('Toutes les pages')}
            </button>
          </div>
          <div className="nora-assist-snooze-durations">
            {DURATIONS.map((d) => {
              const label = d.labelKey ? __(d.labelKey) : d.label
              return (
                <button
                  key={d.hours}
                  className="nora-assist-duration-btn"
                  onMouseEnter={() => setSnoozeInfoText(__('Réapparaîtra dans') + ' ' + label)}
                  onClick={() => onSnooze(routeStr, snoozeScope, d.hours)}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <div className="nora-assist-snooze-info">{snoozeInfoText}</div>
        </div>
      </div>
    </div>
  )

  return createPortal(popup, document.body)
}
