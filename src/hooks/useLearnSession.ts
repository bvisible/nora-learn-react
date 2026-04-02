import { useState, useCallback, useRef, useEffect } from 'react'
import type { LearnState, StepData, NoraLearnConfig, SessionEvent } from '../core/types'
import { LearnSession } from '../core/session'

export interface LearnSessionState {
  isActive: boolean
  state: LearnState | null
  currentStep: StepData | null
  stepIndex: number
  totalSteps: number
  highlightedElement: HTMLElement | null
  highlightRect: DOMRect | null
  popoverElement: HTMLElement | null
  popoverStep: StepData | null
  isCompleted: boolean
  nextLearn?: string
  nextLearnTitle?: string
  error: string | null
}

const INITIAL_STATE: LearnSessionState = {
  isActive: false,
  state: null,
  currentStep: null,
  stepIndex: 0,
  totalSteps: 0,
  highlightedElement: null,
  highlightRect: null,
  popoverElement: null,
  popoverStep: null,
  isCompleted: false,
  error: null,
}

/**
 * Hook to manage a LearnSession lifecycle.
 * Returns session state and control functions.
 */
export function useLearnSession(config: NoraLearnConfig = {}) {
  const [sessionState, setSessionState] = useState<LearnSessionState>(INITIAL_STATE)
  const sessionRef = useRef<LearnSession | null>(null)
  const configRef = useRef(config)
  configRef.current = config

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current?.isActive) {
        sessionRef.current.stop()
      }
    }
  }, [])

  const handleEvent = useCallback((event: SessionEvent) => {
    switch (event.type) {
      case 'started':
        setSessionState((prev) => ({
          ...prev,
          isActive: true,
          state: event.state,
          stepIndex: event.state.current_step,
          totalSteps: event.state.total_steps,
          isCompleted: false,
          error: null,
        }))
        break

      case 'step':
        setSessionState((prev) => ({
          ...prev,
          currentStep: event.step,
          stepIndex: event.stepIndex,
          totalSteps: event.totalSteps,
        }))
        break

      case 'advanced':
        setSessionState((prev) => ({
          ...prev,
          stepIndex: event.stepIndex,
          totalSteps: event.totalSteps,
        }))
        break

      case 'highlight':
        setSessionState((prev) => ({
          ...prev,
          highlightedElement: event.element,
          highlightRect: event.rect,
        }))
        break

      case 'popover':
        setSessionState((prev) => ({
          ...prev,
          popoverElement: event.element,
          popoverStep: event.step,
        }))
        break

      case 'paused':
        setSessionState((prev) => ({
          ...prev,
          isActive: false,
        }))
        break

      case 'stopped':
        setSessionState(INITIAL_STATE)
        sessionRef.current = null
        break

      case 'completed':
        setSessionState((prev) => ({
          ...prev,
          isActive: false,
          isCompleted: true,
          nextLearn: event.nextLearn,
          nextLearnTitle: event.nextLearnTitle,
        }))
        break

      case 'error':
        setSessionState((prev) => ({
          ...prev,
          error: event.message,
        }))
        break
    }
  }, [])

  const startLearn = useCallback(async (learnName: string, skipPrerequisites = false) => {
    // Stop any existing session
    if (sessionRef.current?.isActive) {
      sessionRef.current.stop()
    }

    const session = new LearnSession(learnName, handleEvent, configRef.current, skipPrerequisites)
    sessionRef.current = session
    return session.start()
  }, [handleEvent])

  const resumeLearn = useCallback(async (learnName: string) => {
    if (sessionRef.current?.isActive) {
      sessionRef.current.stop()
    }

    const session = new LearnSession(learnName, handleEvent, configRef.current)
    sessionRef.current = session
    return session.resume()
  }, [handleEvent])

  const pauseLearn = useCallback(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.pause()
    }
  }, [])

  const stopLearn = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.stop()
      sessionRef.current = null
    }
  }, [])

  const restartLearn = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.restart()
    }
  }, [])

  const advanceStep = useCallback(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.advanceStep()
    }
  }, [])

  const executeStep = useCallback(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.executeCurrentStep()
    }
  }, [])

  const resetCompleted = useCallback(() => {
    setSessionState(INITIAL_STATE)
    sessionRef.current = null
  }, [])

  return {
    ...sessionState,
    startLearn,
    resumeLearn,
    pauseLearn,
    stopLearn,
    restartLearn,
    advanceStep,
    executeStep,
    resetCompleted,
    session: sessionRef.current,
  }
}
