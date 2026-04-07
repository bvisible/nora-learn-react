import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { NoraLearnConfig, StepData } from '../core/types'
import { setCsrfToken } from '../core/api'
import { LearnSession } from '../core/session'
import { useLearnSession } from '../hooks/useLearnSession'
import { useAvailableLearns } from '../hooks/useAvailableLearns'
import { useRouteChange } from '../hooks/useRouteChange'
import { LearnSidebar } from './LearnSidebar'
import { LearnPopup } from './LearnPopup'
import { StepPopover } from './StepPopover'
import { PrerequisiteDialog } from './PrerequisiteDialog'

interface NoraLearnContextType {
  startLearn: (name: string, skipPrerequisites?: boolean) => Promise<boolean>
  stopLearn: () => void
  isActive: boolean
}

const NoraLearnContext = createContext<NoraLearnContextType>({
  startLearn: async () => false,
  stopLearn: () => {},
  isActive: false,
})

export function useNoraLearn() {
  return useContext(NoraLearnContext)
}

interface NoraLearnProviderProps {
  config?: NoraLearnConfig
  children: React.ReactNode
}

export function NoraLearnProvider({ config = {}, children }: NoraLearnProviderProps) {
  const [currentRoute, setCurrentRoute] = useState(() =>
    (config.getCurrentRoute || (() => window.location.pathname))()
  )
  const [showPopup, setShowPopup] = useState(false)
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [prereqDialog, setPrereqDialog] = useState<{
    open: boolean
    prerequisites: Array<{ name: string; title: string }>
    learnName: string
  }>({ open: false, prerequisites: [], learnName: '' })

  // Set CSRF token
  useEffect(() => {
    if (config.csrfToken) setCsrfToken(config.csrfToken)
    else if (window.csrf_token) setCsrfToken(window.csrf_token)
  }, [config.csrfToken])

  // Session hook
  const session = useLearnSession(config)

  // Available learns hook
  const { matchingLearns, snoozeRoute, refreshLearns } =
    useAvailableLearns(currentRoute)

  // Route change detection
  useRouteChange(
    useCallback(
      (path: string) => {
        setCurrentRoute(path)
        setShowPopup(false)
        // Show popup after delay (2s) if learns match
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current)
        popupTimerRef.current = setTimeout(() => {
          setShowPopup(true)
        }, 2000)
      },
      []
    )
  )

  // Initial popup after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-resume from localStorage
  useEffect(() => {
    const saved = LearnSession.getSavedState()
    if (saved && !session.isActive) {
      session.resumeLearn(saved.learn_name).then((ok) => {
        if (!ok) LearnSession.clearSavedState()
      })
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start learn handler
  const handleStartLearn = useCallback(
    async (name: string, skipPrerequisites = false) => {
      setShowPopup(false)
      const ok = await session.startLearn(name, skipPrerequisites)

      // Check for recommended prerequisites after start
      if (ok && session.state?.recommended_prerequisites?.length && !skipPrerequisites) {
        setPrereqDialog({
          open: true,
          prerequisites: session.state.recommended_prerequisites,
          learnName: name,
        })
      }

      return ok
    },
    [session]
  )

  const handleStopLearn = useCallback(() => {
    session.stopLearn()
  }, [session])

  const handleNextLearn = useCallback(
    async (name: string) => {
      session.resetCompleted()
      await handleStartLearn(name, true)
    },
    [session, handleStartLearn]
  )

  const handleValidationFail = useCallback(
    (message: string) => {
      const showAlert = config.showAlert || ((msg: string) => console.warn('[Nora Learn]', msg))
      showAlert(message, 'warning')
    },
    [config.showAlert]
  )

  const handleComplete = useCallback(() => {
    const showAlert = config.showAlert || ((msg: string) => console.log('[Nora Learn]', msg))
    showAlert('Learn completed!', 'success')
    refreshLearns()
  }, [config.showAlert, refreshLearns])

  // Watch for completion
  useEffect(() => {
    if (session.isCompleted) {
      handleComplete()
    }
  }, [session.isCompleted, handleComplete])

  // Determine if popover should show
  const showStepPopover =
    session.isActive &&
    session.popoverElement &&
    session.popoverStep &&
    session.popoverStep.highlight_actions?.length

  // Sidebar title
  const sidebarTitle = session.state?.title || session.state?.learn_title || ''

  return (
    <NoraLearnContext.Provider
      value={{
        startLearn: handleStartLearn,
        stopLearn: handleStopLearn,
        isActive: session.isActive,
      }}
    >
      {children}

      {/* Auto-proposal popup */}
      {showPopup && !session.isActive && !session.isCompleted && matchingLearns.length > 0 && (
        <LearnPopup
          learns={matchingLearns}
          routeStr={currentRoute}
          translateFn={config.translate}
          onStart={(name) => handleStartLearn(name)}
          onSnooze={snoozeRoute}
        />
      )}

      {/* Sidebar */}
      <LearnSidebar
        isOpen={session.isActive || session.isCompleted}
        title={sidebarTitle}
        learnName={session.state?.learn_name || ''}
        stepIndex={session.stepIndex}
        totalSteps={session.totalSteps}
        currentStep={session.currentStep}
        highlightRect={session.highlightRect}
        isCompleted={session.isCompleted}
        nextLearn={session.nextLearn}
        nextLearnTitle={session.nextLearnTitle}
        noraIconUrl={config.noraIconUrl}
        translateFn={config.translate}
        onClose={handleStopLearn}
        onFinish={() => session.session?.['_onComplete']?.call(session.session)}
        onRestart={session.restartLearn}
        onDoIt={session.executeStep}
        onContinue={session.advanceStep}
        onNextLearn={handleNextLearn}
        onValidationFail={handleValidationFail}
      />

      {/* Step popover */}
      {showStepPopover && (
        <StepPopover
          element={session.popoverElement}
          step={session.popoverStep!}
          stepIndex={session.stepIndex}
          totalSteps={session.totalSteps}
          translateFn={config.translate}
        />
      )}

      {/* Prerequisite dialog */}
      <PrerequisiteDialog
        isOpen={prereqDialog.open}
        prerequisites={prereqDialog.prerequisites}
        translateFn={config.translate}
        onContinue={() => setPrereqDialog((p) => ({ ...p, open: false }))}
        onDoPrerequisite={(name) => {
          setPrereqDialog((p) => ({ ...p, open: false }))
          handleStartLearn(name, true)
        }}
      />
    </NoraLearnContext.Provider>
  )
}
