// Boot data: learn info injected via frappe.boot.nora_learns
export interface LearnInfo {
  name: string
  title: string
  description?: string
  entry_route?: string
  entry_doctype?: string
  category?: string
  difficulty?: string
  estimated_duration?: number
  is_onboarding?: boolean
  in_progress?: boolean
  current_step?: number
  prerequisites: string[]
  prerequisite_titles: Array<{ name: string; title: string }>
}

// API response from start_learn / get_learn_state
export interface LearnState {
  success: boolean
  learn_name: string
  title?: string
  learn_title?: string
  description?: string
  current_step: number
  total_steps: number
  status?: string
  is_test?: boolean
  entry_route?: string
  next_learn?: string
  next_learn_title?: string
  recommended_prerequisites?: Array<{ name: string; title: string }>
  unmet_prerequisites?: string[]
  error?: string
}

// API response from get_step_as_message
export interface StepData {
  success: boolean
  step_index: number
  total_steps?: number
  title?: string
  explanation: string
  action_type: string
  action_target?: string
  is_checkpoint?: boolean
  is_last_step?: boolean
  wait_condition?: string
  wait_timeout?: number
  skip_if?: string
  allow_skip?: boolean
  validation_rule?: string
  on_error_message?: string
  highlight_actions?: HighlightAction[]
  execute_actions?: BrowserAction[]
}

export interface HighlightAction {
  action: string
  selector: string
  options?: Record<string, unknown>
  [key: string]: unknown
}

export interface BrowserAction {
  action: string
  selector?: string
  value?: string
  url?: string
  fieldname?: string
  [key: string]: unknown
}

// API response from advance_step
export interface AdvanceResult {
  success: boolean
  current_step: number
  completed: boolean
}

// Sidebar step message data
export interface StepMessageData {
  step_index: number
  total_steps: number
  explanation: string
  action_type: string
  is_checkpoint?: boolean
  has_execute_actions?: boolean
  has_wait_condition?: boolean
}

// Provider config: allows each SPA to customize behavior
export interface NoraLearnConfig {
  /** App identifier for context */
  appName?: string
  /** Navigate to a URL — defaults to window.location.href assignment */
  navigate?: (url: string) => void
  /** Get current route path — defaults to window.location.pathname */
  getCurrentRoute?: () => string
  /** Show toast/alert */
  showAlert?: (message: string, variant: 'success' | 'warning' | 'error' | 'info') => void
  /** CSRF token — defaults to window.csrf_token */
  csrfToken?: string
  /** Nora icon URL */
  noraIconUrl?: string
  /** Translation function — defaults to frappe._messages lookup */
  translate?: (text: string) => string
}

// Session events emitted to React layer
export type SessionEvent =
  | { type: 'started'; state: LearnState }
  | { type: 'step'; step: StepData; stepIndex: number; totalSteps: number }
  | { type: 'advanced'; stepIndex: number; totalSteps: number }
  | { type: 'paused' }
  | { type: 'stopped' }
  | { type: 'completed'; nextLearn?: string; nextLearnTitle?: string }
  | { type: 'error'; message: string }
  | { type: 'highlight'; element: HTMLElement | null; rect: DOMRect | null }
  | { type: 'popover'; element: HTMLElement | null; step: StepData }

// Saved learn state in localStorage
export interface SavedLearnState {
  learn_name: string
  current_step: number
  total_steps: number
  title: string
  timestamp: number
}

// Global window augmentation for Frappe boot data
declare global {
  interface Window {
    frappe?: {
      boot?: {
        nora_learns?: LearnInfo[]
        user?: { name: string; full_name?: string }
        user_info?: Record<string, { fullname: string; image?: string }>
        sitename?: string
      }
      _messages?: Record<string, string>
    }
    csrf_token?: string
  }
}
