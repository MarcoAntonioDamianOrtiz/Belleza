export function unwrapData<T>(response: T | { data: T }): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data: T }).data
  }

  return response as T
}
