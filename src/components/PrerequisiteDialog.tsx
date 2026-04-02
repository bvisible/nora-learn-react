import React from 'react'
import { createPortal } from 'react-dom'
import { translate, escapeHtml } from '../core/utils'

interface PrerequisiteDialogProps {
  isOpen: boolean
  prerequisites: Array<{ name: string; title: string }>
  translateFn?: (text: string) => string
  onContinue: () => void
  onDoPrerequisite: (name: string) => void
}

export function PrerequisiteDialog({
  isOpen,
  prerequisites,
  translateFn,
  onContinue,
  onDoPrerequisite,
}: PrerequisiteDialogProps) {
  const __ = (t: string) => translate(t, translateFn)

  if (!isOpen || !prerequisites.length) return null

  const dialog = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onContinue}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '24px',
          maxWidth: 420,
          width: '90vw',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>
          {__('Recommended Prerequisites')}
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
          {__('We recommend completing these formations first:')}
        </p>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
          {prerequisites.map((p) => (
            <li key={p.name} style={{ padding: '4px 0', fontWeight: 600 }}>
              {escapeHtml(p.title)}
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: 'white',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onClick={() => onDoPrerequisite(prerequisites[0].name)}
          >
            {__('Do it first')}
          </button>
          <button
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              background: '#7c3aed',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={onContinue}
          >
            {__('Continue anyway')}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
