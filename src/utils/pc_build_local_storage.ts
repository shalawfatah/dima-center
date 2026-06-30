import { useEffect, useState } from 'react'

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with default value first to avoid hydration mismatch
  const [state, setState] = useState<T>(defaultValue)

  // Once mounted on client, read the actual value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setState(JSON.parse(item))
      }
    } catch (error) {
      console.error('Error reading localStorage key:', key, error)
    }
  }, [key])

  // Wrap the state setter to save automatically to localStorage on changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error writing localStorage key:', key, error)
    }
  }

  return [state, setValue]
}
