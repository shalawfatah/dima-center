import { useCallback, useRef, useSyncExternalStore } from 'react'

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const cacheRef = useRef<{ raw: string | null; parsed: T }>({
    raw: null,
    parsed: defaultValue,
  })

  const getSnapshot = useCallback((): T => {
    if (typeof window === 'undefined') return cacheRef.current.parsed

    let raw: string | null = null
    try {
      raw = window.localStorage.getItem(key)
    } catch (error) {
      console.error('Error reading localStorage key:', key, error)
      return cacheRef.current.parsed
    }

    if (raw === cacheRef.current.raw) return cacheRef.current.parsed

    let parsed: T
    try {
      parsed = raw == null ? defaultValue : (JSON.parse(raw) as T)
    } catch (error) {
      console.error('Error parsing localStorage key:', key, error)
      parsed = defaultValue
    }
    cacheRef.current = { raw, parsed }
    return parsed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') return () => {}

      const handleStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === key) onStoreChange()
      }
      const handleCustom = (e: Event) => {
        const detail = (e as CustomEvent<{ key?: string }>).detail
        if (!detail || detail.key === key) onStoreChange()
      }

      window.addEventListener('storage', handleStorage)
      window.addEventListener('local-storage', handleCustom as EventListener)

      return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener('local-storage', handleCustom as EventListener)
      }
    },
    [key],
  )

  const getServerSnapshot = useCallback(
    (): T => defaultValue,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const next = value instanceof Function ? (value as (v: T) => T)(getSnapshot()) : value
        window.localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }))
      } catch (error) {
        console.error('Error writing localStorage key:', key, error)
      }
    },
    [key, getSnapshot],
  )

  return [state, setValue]
}
