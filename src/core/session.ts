import type { LearnState, StepData, NoraLearnConfig, SessionEvent, SavedLearnState } from './types'
import * as api from './api'
import { removeHighlight, findVisibleElement, executeMany, executeHighlightActions } from './browser-actions'
import { sleep } from './utils'

const LOCAL_KEY = 'nora_active_learn'
const MAX_RESUME_AGE = 600_000 // 10 minutes
const MAX_LOCAL_AGE = 3_600_000 // 1 hour

type EventHandler = (event: SessionEvent) => void

/**
 * LearnSession — Core orchestrator for interactive learning.
 * Framework-agnostic: emits events instead of manipulating DOM directly.
 * React components subscribe to these events via the provider.
 */
export class LearnSession {
  learnName: string
  skipPrerequisites: boolean
  state: LearnState | null = null
  isActive = false
  currentStep: StepData | null = null

  private _config: NoraLearnConfig
  private _onEvent: EventHandler
  private _watchInterval: ReturnType<typeof setInterval> | null = null
  private _pageChangeCleanup: (() => void) | null = null
  private _clickAdvanceHandler: (() => void) | null = null
  private _clickAdvanceTarget: HTMLElement | null = null
  private _advancing = false
  private _popoverEl: HTMLElement | null = null

  constructor(
    learnName: string,
    onEvent: EventHandler,
    config: NoraLearnConfig = {},
    skipPrerequisites = false
  ) {
    this.learnName = learnName
    this._onEvent = onEvent
    this._config = config
    this.skipPrerequisites = skipPrerequisites
  }

  // ========== Lifecycle ==========

  async start(): Promise<boolean> {
    try {
      const result = await api.startLearn(this.learnName, this.skipPrerequisites)

      if (!result.success) {
        if (result.unmet_prerequisites) {
          this._emit({ type: 'error', message: 'prerequisites_required' })
        }
        return false
      }

      this.state = result

      // Check recommended prerequisites
      if (result.recommended_prerequisites?.length && !this.skipPrerequisites) {
        // Emit event — React component will show dialog
        // The dialog result will call continueAfterPrerequisites() or startPrerequisite()
      }

      this.isActive = true
      this._emit({ type: 'started', state: result })

      // Navigate to entry route if needed
      if (result.entry_route) {
        const navigate = this._config.navigate || ((url: string) => { window.location.href = url })
        const getCurrentRoute = this._config.getCurrentRoute || (() => window.location.pathname)
        const currentPath = getCurrentRoute()

        if (currentPath !== result.entry_route) {
          navigate(result.entry_route)
          this._saveLocalState()
          return true // Page will reload, auto-resume handles the rest
        }
      }

      this._saveLocalState()
      this._bindPageChange()

      // Wait for page to be ready
      await this._waitForPageReady()
      await sleep(500)

      // Display first step
      await this._fetchAndDisplayStep()
      return true
    } catch (e) {
      console.error('[Nora Learn] start() error:', e)
      this._emit({ type: 'error', message: 'Error starting learn' })
      return false
    }
  }

  async resume(): Promise<boolean> {
    try {
      const saved = this._loadLocalState()
      if (!saved || saved.learn_name !== this.learnName) return false

      let result = await api.getLearnState(this.learnName)

      if (!result?.success) {
        // Progress lost — re-start to create it
        result = await api.startLearn(this.learnName)
        if (!result?.success) return false
      }

      this.state = result
      this.isActive = true
      this._emit({ type: 'started', state: result })

      // Restore step position from localStorage
      if (saved.current_step && saved.current_step > (result.current_step || 0)) {
        this.state.current_step = saved.current_step
      }

      this._bindPageChange()
      this._saveLocalState()
      await this._fetchAndDisplayStep()
      return true
    } catch (e) {
      console.error('[Nora Learn] resume() error:', e)
      return false
    }
  }

  async pause(): Promise<void> {
    this._stopWatching()
    this.isActive = false
    try { await api.pauseLearn(this.learnName) } catch { /* ignore */ }
    removeHighlight()
    this._unbindPageChange()
    this._dismissPopover()
    this._saveLocalState()
    this._emit({ type: 'paused' })
  }

  stop(): void {
    this._stopWatching()
    this.isActive = false
    removeHighlight()
    this._unbindPageChange()
    this._dismissPopover()
    this._clearClickListener()
    this._clearLocalState()
    this._emit({ type: 'stopped' })
  }

  async restart(): Promise<void> {
    this._stopWatching()
    removeHighlight()
    this._dismissPopover()
    this._unbindPageChange()
    this.isActive = true

    try { await api.resetLearn(this.learnName) } catch { /* ignore */ }

    this.state = null
    this.currentStep = null
    this._clearLocalState()
    await this.start()
  }

  async advanceStep(): Promise<void> {
    if (this._advancing) return
    this._advancing = true

    if (!this.isActive || !this.state) { this._advancing = false; return }

    // If current step targets a tab, click it before advancing
    if (this.currentStep?.highlight_actions?.length) {
      const selector = this.currentStep.highlight_actions[0].selector
      if (selector) {
        const el = findVisibleElement(selector)
        if (el?.closest('.form-tabs, .nav')) {
          el.click()
          await sleep(300)
        }
      }
    }

    this._stopWatching()
    removeHighlight()
    this._dismissPopover()

    try {
      const nextStep = (this.state.current_step || 0) + 1

      if (this.state.is_test) {
        // Draft learns: advance client-side only
        if (nextStep >= this.state.total_steps) {
          this._onComplete()
          return
        }
        this.state.current_step = nextStep
      } else {
        const result = await api.advanceStep(this.learnName)
        if (!result?.success) return
        if (result.completed) { this._onComplete(); return }
        this.state.current_step = result.current_step
      }

      this._saveLocalState()
      this._emit({ type: 'advanced', stepIndex: this.state.current_step, totalSteps: this.state.total_steps })
      await sleep(500)
      await this._fetchAndDisplayStep()
    } catch (e) {
      console.error('[Nora Learn] advanceStep() error:', e)
    } finally {
      this._advancing = false
    }
  }

  async executeCurrentStep(): Promise<void> {
    if (!this.currentStep?.execute_actions) return

    try {
      await executeMany(this.currentStep.execute_actions)

      if (this.currentStep.action_type === 'click' || this.currentStep.action_type === 'navigate') {
        await sleep(2000)
      }

      if (!this.currentStep.wait_condition) {
        if (this.currentStep.is_last_step) { this._onComplete() }
        else { await this.advanceStep() }
      }
    } catch (e) {
      console.error('[Nora Learn] executeCurrentStep() error:', e)
    }
  }

  // ========== Internal: Step Management ==========

  private async _fetchAndDisplayStep(): Promise<void> {
    if (!this.isActive || !this.state) return

    const stepIndex = this.state.current_step

    try {
      const step = await api.getStepAsMessage(
        this.learnName,
        stepIndex,
        this.state.is_test || false
      )

      if (!step.success) return
      this.currentStep = step

      // Check skip_if
      if (step.skip_if) {
        try {
          if (new Function(`return !!(${step.skip_if})`)()) {
            if (step.is_last_step) { this._onComplete() }
            else { await this.advanceStep() }
            return
          }
        } catch { /* not evaluable */ }
      }

      // Check allow_skip
      if (step.allow_skip && step.wait_condition) {
        try {
          if (new Function(`return !!(${step.wait_condition})`)()) {
            if (step.is_last_step) { this._onComplete() }
            else { await this.advanceStep() }
            return
          }
        } catch { /* not evaluable */ }
      }

      this._dismissPopover()
      removeHighlight()

      if (step.highlight_actions?.length) {
        await sleep(300)
        await this._highlightTarget(step)
      }

      // Emit step event for React components to render
      this._emit({
        type: 'step',
        step,
        stepIndex,
        totalSteps: this.state.total_steps,
      })

      // Start watching for step completion
      if (step.wait_condition && !step.is_checkpoint) {
        this._startWatchingCondition(step)
      }
    } catch (e) {
      console.error('[Nora Learn] _fetchAndDisplayStep() error:', e)
    }
  }

  private async _highlightTarget(step: StepData): Promise<void> {
    const targetEl = await executeHighlightActions(step.highlight_actions || [])

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect()
      this._emit({ type: 'highlight', element: targetEl, rect })
      this._emit({ type: 'popover', element: targetEl, step })

      // Auto-advance on click (not for input fields)
      this._clearClickListener()
      const isInput = targetEl.matches('input, textarea, select, [contenteditable]') ||
        !!targetEl.querySelector('input, textarea, select, [contenteditable]')
      if (!isInput) {
        this._clickAdvanceHandler = () => {
          this._clearClickListener()
          setTimeout(() => {
            if (this.isActive) this.advanceStep()
          }, 500)
        }
        targetEl.addEventListener('click', this._clickAdvanceHandler, { once: true })
        this._clickAdvanceTarget = targetEl
      }
    } else {
      // Element not found — emit without highlight
      this._emit({ type: 'highlight', element: null, rect: null })
    }
  }

  private _onComplete(): void {
    this._stopWatching()
    this.isActive = false
    removeHighlight()
    this._dismissPopover()
    this._unbindPageChange()
    this._clearClickListener()
    this._clearLocalState()

    const nextLearn = this.state?.next_learn
    const nextLearnTitle = this.state?.next_learn_title

    // Cleanup demo documents
    api.cleanupDemoDocuments(this.learnName)

    this._emit({
      type: 'completed',
      nextLearn: nextLearn || undefined,
      nextLearnTitle: nextLearnTitle || undefined,
    })
  }

  // ========== Condition Watching ==========

  private _startWatchingCondition(step: StepData): void {
    this._stopWatching()
    const condition = step.wait_condition
    if (!condition) return
    const deadline = Date.now() + ((step.wait_timeout || 30) * 1000)

    this._watchInterval = setInterval(() => {
      if (!this.isActive) { this._stopWatching(); return }
      try {
        if (new Function(`return !!(${condition})`)()) {
          this._stopWatching()
          if (step.is_last_step) { this._onComplete() }
          else { this.advanceStep() }
        }
      } catch { /* not evaluable yet */ }
      if (Date.now() >= deadline) {
        this._stopWatching()
        this._emit({ type: 'error', message: 'timeout' })
      }
    }, 500)
  }

  private _stopWatching(): void {
    if (this._watchInterval) {
      clearInterval(this._watchInterval)
      this._watchInterval = null
    }
  }

  // ========== Page Change Handling ==========

  private _bindPageChange(): void {
    this._unbindPageChange()

    const handler = () => {
      if (!this.isActive) return
      setTimeout(() => {
        if (!this.isActive || !this.currentStep) return
        if (this.currentStep.highlight_actions?.length) {
          this._highlightTarget(this.currentStep)
        }
        if (this.currentStep.wait_condition && !this.currentStep.is_checkpoint) {
          this._startWatchingCondition(this.currentStep)
        }
      }, 1000)
    }

    // Intercept pushState/replaceState for SPA navigation
    const origPush = history.pushState.bind(history)
    const origReplace = history.replaceState.bind(history)

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      origPush(...args)
      handler()
    }
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      origReplace(...args)
      handler()
    }

    const popstateHandler = () => handler()
    window.addEventListener('popstate', popstateHandler)

    this._pageChangeCleanup = () => {
      history.pushState = origPush
      history.replaceState = origReplace
      window.removeEventListener('popstate', popstateHandler)
    }
  }

  private _unbindPageChange(): void {
    if (this._pageChangeCleanup) {
      this._pageChangeCleanup()
      this._pageChangeCleanup = null
    }
  }

  // ========== Popover Management ==========

  private _dismissPopover(): void {
    if (this._popoverEl) {
      this._popoverEl.remove()
      this._popoverEl = null
    }
    // Also remove orphaned popovers
    document.getElementById('nora-step-popover')?.remove()
  }

  // ========== Click Listener ==========

  private _clearClickListener(): void {
    if (this._clickAdvanceTarget && this._clickAdvanceHandler) {
      this._clickAdvanceTarget.removeEventListener('click', this._clickAdvanceHandler)
      this._clickAdvanceHandler = null
      this._clickAdvanceTarget = null
    }
  }

  // ========== Local State Persistence ==========

  private _saveLocalState(): void {
    if (!this.state) return
    try {
      const data: SavedLearnState = {
        learn_name: this.learnName,
        current_step: this.state.current_step,
        total_steps: this.state.total_steps,
        title: this.state.title || this.state.learn_title || '',
        timestamp: Date.now(),
      }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
    } catch { /* ignore */ }
  }

  private _loadLocalState(): SavedLearnState | null {
    try {
      const d = localStorage.getItem(LOCAL_KEY)
      if (!d) return null
      const p = JSON.parse(d) as SavedLearnState
      if (Date.now() - p.timestamp > MAX_LOCAL_AGE) { this._clearLocalState(); return null }
      return p
    } catch { return null }
  }

  private _clearLocalState(): void {
    try { localStorage.removeItem(LOCAL_KEY) } catch { /* ignore */ }
  }

  // ========== Utilities ==========

  private async _waitForPageReady(): Promise<void> {
    const maxWait = 5000
    const start = Date.now()
    while (Date.now() - start < maxWait) {
      if (document.readyState === 'complete') return
      await sleep(200)
    }
  }

  private _emit(event: SessionEvent): void {
    try { this._onEvent(event) } catch (e) { console.error('[Nora Learn] Event handler error:', e) }
  }

  // ========== Static: Auto-resume ==========

  static getSavedState(): SavedLearnState | null {
    try {
      const d = localStorage.getItem(LOCAL_KEY)
      if (!d) return null
      const p = JSON.parse(d) as SavedLearnState
      if (Date.now() - p.timestamp > MAX_RESUME_AGE) {
        localStorage.removeItem(LOCAL_KEY)
        return null
      }
      return p
    } catch { return null }
  }

  static clearSavedState(): void {
    try { localStorage.removeItem(LOCAL_KEY) } catch { /* ignore */ }
  }
}
