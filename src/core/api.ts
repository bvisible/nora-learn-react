import type { LearnState, StepData, AdvanceResult, LearnInfo } from './types'

let _csrfToken: string | undefined

export function setCsrfToken(token: string) {
  _csrfToken = token
}

function getCsrfToken(): string {
  return _csrfToken || window.csrf_token || 'None'
}

/**
 * Call a Frappe whitelisted API method via POST
 */
async function frappePost<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const formData = new FormData()
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    }
  }

  const response = await fetch(`/api/method/${method}`, {
    method: 'POST',
    headers: { 'X-Frappe-CSRF-Token': getCsrfToken() },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.message as T
}

// ========== Learn Engine API ==========

export async function startLearn(
  learnName: string,
  skipPrerequisites = false
): Promise<LearnState> {
  return frappePost<LearnState>('nora.api.learn_engine.start_learn', {
    learn_name: learnName,
    skip_prerequisites: skipPrerequisites ? 1 : 0,
  })
}

export async function getLearnState(learnName: string): Promise<LearnState> {
  return frappePost<LearnState>('nora.api.learn_engine.get_learn_state', {
    learn_name: learnName,
  })
}

export async function getStepAsMessage(
  learnName: string,
  stepIndex: number,
  isTest = false
): Promise<StepData> {
  return frappePost<StepData>('nora.api.learn_engine.get_step_as_message', {
    learn_name: learnName,
    step_index: stepIndex,
    is_test: isTest ? 1 : 0,
  })
}

export async function advanceStep(learnName: string): Promise<AdvanceResult> {
  return frappePost<AdvanceResult>('nora.api.learn_engine.advance_step', {
    learn_name: learnName,
  })
}

export async function pauseLearn(learnName: string): Promise<{ success: boolean }> {
  return frappePost<{ success: boolean }>('nora.api.learn_engine.pause_learn', {
    learn_name: learnName,
  })
}

export async function completeLearn(learnName: string): Promise<{ success: boolean }> {
  return frappePost<{ success: boolean }>('nora.api.learn_engine.complete_learn', {
    learn_name: learnName,
  })
}

export async function resetLearn(learnName: string): Promise<{ success: boolean }> {
  return frappePost<{ success: boolean }>('nora.api.learn_engine.reset_learn', {
    learn_name: learnName,
  })
}

export async function getAvailableLearns(): Promise<{ success: boolean; learns: LearnInfo[] }> {
  return frappePost<{ success: boolean; learns: LearnInfo[] }>(
    'nora.api.learn_engine.get_available_learns',
    {}
  )
}

export async function cleanupDemoDocuments(learnName: string): Promise<void> {
  try {
    await frappePost('nora.api.learn_engine.cleanup_nora_demo_documents', {
      learn_name: learnName,
    })
  } catch {
    // Fire-and-forget
  }
}
