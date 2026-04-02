import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { StepData } from '../core/types'
import * as api from '../core/api'
import { executeAction } from '../core/browser-actions'
import { translate, escapeHtml, getUserAvatarUrl, getCurrentUser } from '../core/utils'

interface ChatAreaProps {
  isExpanded: boolean
  learnName: string
  learnTitle: string
  currentStep: StepData | null
  stepIndex: number
  totalSteps: number
  noraIconUrl: string
  translateFn?: (text: string) => string
}

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export function ChatArea({
  isExpanded,
  learnName,
  learnTitle,
  currentStep,
  stepIndex,
  totalSteps,
  noraIconUrl,
  translateFn,
}: ChatAreaProps) {
  const __ = (t: string) => translate(t, translateFn)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const knownMsgNames = useRef<Set<string>>(new Set())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isExpanded])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setIsLoading(false)
  }, [])

  const startPolling = useCallback(() => {
    stopPolling()
    pollCountRef.current = 0

    pollRef.current = setInterval(async () => {
      pollCountRef.current++
      if (pollCountRef.current > 240) {
        stopPolling()
        setMessages(prev => [...prev, {
          id: `timeout-${Date.now()}`,
          role: 'assistant',
          text: __('Response is taking too long. Please try again.'),
        }])
        return
      }

      if (!threadId) return

      try {
        const result = await api.getThreadMessages(threadId)
        if (result.success && result.messages) {
          for (const msg of result.messages) {
            if (msg.is_bot && !knownMsgNames.current.has(msg.name)) {
              knownMsgNames.current.add(msg.name)
              setMessages(prev => [...prev, {
                id: msg.name,
                role: 'assistant',
                text: msg.text,
              }])
              stopPolling()

              // Execute browser actions if any
              try {
                const actionsResult = await api.getBrowserActions(threadId)
                if (actionsResult.success && actionsResult.actions?.length) {
                  for (const action of actionsResult.actions) {
                    await executeAction(action)
                  }
                }
              } catch { /* ignore */ }
            }
          }
        }
      } catch { /* ignore polling errors */ }
    }, 500)
  }, [threadId, stopPolling, __])

  const buildContext = useCallback(() => {
    const user = getCurrentUser()
    const ctx: Record<string, unknown> = {
      route: window.location.pathname,
      user: user.name,
      user_fullname: user.fullName,
    }

    if (currentStep) {
      ctx.learn_context = {
        learn_name: learnName,
        learn_title: learnTitle,
        current_step: stepIndex,
        total_steps: totalSteps,
        step_title: currentStep.title || '',
        step_action_type: currentStep.action_type || '',
        step_action_target: currentStep.action_target || '',
      }
    }

    return ctx
  }, [currentStep, learnName, learnTitle, stepIndex, totalSteps])

  const sendMessage = useCallback(async (text: string) => {
    if (isLoading || !text.trim()) return
    setIsLoading(true)

    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    }])

    try {
      const context = JSON.stringify(buildContext())

      if (!threadId) {
        const result = await api.startConversation(text, context)
        if (result.success && result.thread_id) {
          setThreadId(result.thread_id)
          // Start polling after state update
          setTimeout(() => startPolling(), 100)
        }
      } else {
        await api.sendMessageInThread(threadId, text, context)
        startPolling()
      }
    } catch (e) {
      console.error('[Nora Learn Chat] error:', e)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: __('Sorry, an error occurred. Please try again.'),
      }])
      setIsLoading(false)
    }
  }, [isLoading, threadId, buildContext, startPolling, __])

  // Update startPolling when threadId changes
  useEffect(() => {
    // Reassign startPolling closure with new threadId
  }, [threadId, startPolling])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!textareaRef.current) return
    const text = textareaRef.current.value.trim()
    if (!text) return
    textareaRef.current.value = ''
    textareaRef.current.style.height = 'auto'
    sendMessage(text)
  }

  const handleInput = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px'
  }

  if (!isExpanded) return null

  const user = getCurrentUser()
  const avatarUrl = getUserAvatarUrl(user.name)

  return (
    <div
      className="nora-lp-chat-area"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      {/* Chat messages */}
      <div className="nora-lp-chat-messages" ref={chatMessagesRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`nora-ls-message ${msg.role === 'user' ? 'nora-ls-message-user' : 'nora-ls-message-bot'}`}>
            {msg.role === 'user' ? (
              <div className="nora-ls-avatar nora-ls-avatar-user">
                {avatarUrl
                  ? <img src={avatarUrl} alt={user.name} />
                  : <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{user.fullName.charAt(0).toUpperCase()}</div>
                }
              </div>
            ) : (
              <div className="nora-ls-avatar nora-ls-avatar-bot">
                <img src={noraIconUrl} alt="NORA" />
              </div>
            )}
            <div
              className="nora-ls-message-content"
              dangerouslySetInnerHTML={{
                __html: msg.role === 'user' ? escapeHtml(msg.text) : msg.text
              }}
            />
          </div>
        ))}
        {/* Typing indicator */}
        {isLoading && (
          <div className="nora-ls-message nora-ls-message-bot nora-ls-typing">
            <div className="nora-ls-avatar nora-ls-avatar-bot">
              <img src={noraIconUrl} alt="NORA" />
            </div>
            <div className="nora-ls-message-content nora-ls-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="nora-lp-input-wrapper">
        <textarea
          ref={textareaRef}
          className="nora-lp-textarea"
          placeholder={__('Ask NORA anything...')}
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        <button
          className="nora-lp-send"
          title={__('Send')}
          disabled={isLoading}
          onClick={(e) => { e.stopPropagation(); handleSend() }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
