export interface PaginatedResults<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export interface WrappedData<T> {
  success?: boolean
  message?: string
  data: T
}

export function unwrapData<T>(response: T | WrappedData<T>): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as WrappedData<T>).data
  }

  return response as T
}

export function unwrapList<T>(
  response: T[] | WrappedData<T[]> | PaginatedResults<T>,
): T[] {
  if (Array.isArray(response)) return response

  if (typeof response === 'object' && response !== null) {
    if ('data' in response && Array.isArray((response as WrappedData<T[]>).data)) {
      return (response as WrappedData<T[]>).data
    }

    if ('results' in response && Array.isArray((response as PaginatedResults<T>).results)) {
      return (response as PaginatedResults<T>).results
    }
  }

  return []
}
