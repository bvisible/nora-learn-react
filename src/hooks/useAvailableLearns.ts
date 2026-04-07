import { useState, useEffect, useCallback } from 'react'
import type { LearnInfo } from '../core/types'
import * as api from '../core/api'

/**
 * Hook to access available learns from frappe.boot or API.
 * Returns learns matching the current route.
 */
export function useAvailableLearns(currentRoute: string) {
  const [allLearns, setAllLearns] = useState<LearnInfo[]>(() => {
    return window.frappe?.boot?.nora_learns || []
  })
  const [matchingLearns, setMatchingLearns] = useState<LearnInfo[]>([])

  // Filter learns matching current route
  useEffect(() => {
    if (!allLearns.length) {
      setMatchingLearns([])
      return
    }

    const snoozed = _getSnoozed()
    const routeStr = currentRoute.replace(/^\//, '')

    // Check global snooze
    if (snoozed['__all__'] && Date.now() < snoozed['__all__']) {
      setMatchingLearns([])
      return
    }

    // Check per-route snooze
    if (snoozed[routeStr] && Date.now() < snoozed[routeStr]) {
      setMatchingLearns([])
      return
    }

    const matching = allLearns.filter((learn) => {
      // Match by entry_route
      if (learn.entry_route) {
        const learnRoute = learn.entry_route.replace(/^\//, '')
        if (routeStr.toLowerCase() === learnRoute.toLowerCase()) return true
        // Partial match: /mint matches entry_route /mint/...
        if (routeStr.startsWith(learnRoute.toLowerCase() + '/') ||
            learnRoute.startsWith(routeStr.toLowerCase() + '/')) return true
      }

      // Onboarding learns on home page
      const isHome = currentRoute === '/' || currentRoute === '/app' ||
                     currentRoute === '/app/' || currentRoute === '/app/home'
      if (isHome && learn.is_onboarding) return true

      return false
    })

    // Sort: no prerequisites first
    const matchNames = matching.map((l) => l.name)
    matching.sort((a, b) => {
      const aHas = (a.prerequisites || []).some((p) => matchNames.includes(p))
      const bHas = (b.prerequisites || []).some((p) => matchNames.includes(p))
      if (aHas && !bHas) return 1
      if (!aHas && bHas) return -1
      return a.name < b.name ? -1 : 1
    })

    setMatchingLearns(matching)
  }, [allLearns, currentRoute])

  // Snooze learns (per-route or global)
  const snoozeRoute = useCallback((route: string, scope: 'page' | 'all', hours: number) => {
    const snoozed = _getSnoozed()
    const expiry = Date.now() + hours * 60 * 60 * 1000
    if (scope === 'all') {
      snoozed['__all__'] = expiry
    } else {
      const routeStr = route.replace(/^\//, '')
      snoozed[routeStr] = expiry
    }
    localStorage.setItem('nora_learn_snoozed', JSON.stringify(snoozed))
    setMatchingLearns([])
  }, [])

  // Refresh from API
  const refreshLearns = useCallback(async () => {
    try {
      const result = await api.getAvailableLearns()
      if (result.success && result.learns) {
        setAllLearns(result.learns)
        // Update boot data too
        if (window.frappe?.boot) {
          window.frappe.boot.nora_learns = result.learns
        }
      }
    } catch { /* ignore */ }
  }, [])

  return { allLearns, matchingLearns, snoozeRoute, refreshLearns }
}

// ========== localStorage helpers ==========

function _getSnoozed(): Record<string, number> {
  try {
    const snoozed = JSON.parse(localStorage.getItem('nora_learn_snoozed') || '{}') as Record<string, number>
    // Clean expired
    const now = Date.now()
    let changed = false
    for (const key of Object.keys(snoozed)) {
      if (snoozed[key] < now) { delete snoozed[key]; changed = true }
    }
    if (changed) localStorage.setItem('nora_learn_snoozed', JSON.stringify(snoozed))
    return snoozed
  } catch { return {} }
}
