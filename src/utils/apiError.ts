import axios from 'axios'

interface ApiErrorBody {
  message?: string
  mensaje?: string
  detail?: string
  errors?: Record<string, string[] | string>
}

export function getFriendlyError(
  error: unknown,
  fallback = 'No fue posible completar la operación. Intenta nuevamente.',
): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback
  }

  const body = error.response?.data

  if (body?.message) return body.message
  if (body?.mensaje) return body.mensaje
  if (body?.detail) return body.detail

  if (body?.errors) {
    const first = Object.values(body.errors)[0]

    if (Array.isArray(first) && first[0]) return first[0]
    if (typeof first === 'string') return first
  }

  if (!error.response) {
    return 'No fue posible completar la operación. Intenta nuevamente.'
  }

  return fallback
}
