import { useEffect, useRef } from 'react'

/**
 * Hook to detect SPA route changes.
 * Intercepts pushState/replaceState and listens to popstate.
 */
export function useRouteChange(callback: (path: string) => void): void {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const notify = () => cbRef.current(window.location.pathname)

    const origPush = history.pushState.bind(history)
    const origReplace = history.replaceState.bind(history)

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      origPush(...args)
      notify()
    }
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      origReplace(...args)
      notify()
    }

    const popstateHandler = () => notify()
    window.addEventListener('popstate', popstateHandler)

    return () => {
      history.pushState = origPush
      history.replaceState = origReplace
      window.removeEventListener('popstate', popstateHandler)
    }
  }, [])
}
