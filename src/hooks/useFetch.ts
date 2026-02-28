import { useState, useEffect, useCallback } from 'react'

interface UseFetchResult<T> {
  data:    T | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

export function useFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchFn()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message ?? 'Error al cargar datos'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
