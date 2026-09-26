import type { AxiosInstance } from 'axios'

export interface BackendPage<T> {
  items: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
  next: string | null
  previous: string | null
}

interface ParsedPage<T> {
  items: T[]
  count: number
  next: string | null
  previous: string | null
}

/** Soporta los tres formatos documentados: DRF, {success,count,data:[]} y {success,data:{count,results}}. */
export function parseBackendPage<T>(body: unknown): ParsedPage<T> {
  if (Array.isArray(body))
    return { items: body as T[], count: body.length, next: null, previous: null }
  if (!body || typeof body !== 'object')
    throw new Error('La respuesta del listado no tiene el formato esperado.')

  const outer = body as Record<string, unknown>
  const nested =
    outer.data && !Array.isArray(outer.data) && typeof outer.data === 'object'
      ? (outer.data as Record<string, unknown>)
      : null
  const payload = nested ?? outer
  const items = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(outer.data)
        ? outer.data
        : null
  if (!items) throw new Error('El listado no contiene los datos esperados.')
  const count = Number(payload.count ?? outer.count ?? items.length)
  return {
    items: items as T[],
    count: Number.isFinite(count) ? count : items.length,
    next: typeof payload.next === 'string' ? payload.next : null,
    previous: typeof payload.previous === 'string' ? payload.previous : null,
  }
}

/** Convierte next/previous del backend en una ruta local; evita enviar JWT a dominios ajenos. */
function safePageUrl(next: string, baseURL: string | undefined): string {
  const base = new URL((baseURL ?? '/api').replace(/\/+$/, '') + '/', 'http://localhost')
  const target = new URL(next, base)
  const basePath = base.pathname.replace(/\/+$/, '')
  const pathname = target.pathname
  if (!pathname.startsWith(basePath + '/') && pathname !== basePath) {
    throw new Error('La ruta de paginación no corresponde a la API configurada.')
  }
  return pathname.slice(basePath.length) + target.search
}

export async function getBackendPage<T>(
  client: AxiosInstance,
  url: string,
  options?: {
    page?: number
    pageSize?: number
    params?: Record<string, string | number | boolean | undefined>
    nextUrl?: string
  },
): Promise<BackendPage<T>> {
  const page = Math.max(1, Number(options?.page ?? 1))
  const pageSize = Math.min(200, Math.max(1, Number(options?.pageSize ?? 50)))
  const response = options?.nextUrl
    ? await client.get<unknown>(safePageUrl(options.nextUrl, client.defaults.baseURL))
    : await client.get<unknown>(url, {
        params: { ...options?.params, page, page_size: pageSize },
      })
  const result = parseBackendPage<T>(response.data)
  const actualPageSize = result.items.length > 0 && result.next ? result.items.length : pageSize
  return {
    ...result,
    page,
    pageSize: actualPageSize,
    totalPages: Math.max(1, Math.ceil(result.count / Math.max(actualPageSize, 1))),
  }
}

export async function getAllPages<T>(
  client: AxiosInstance,
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T[]> {
  const result: T[] = []
  const visited = new Set<string>()
  let next: string | null = null
  for (let page = 1; page <= 1000; page++) {
    const response: BackendPage<T> = await getBackendPage<T>(client, url, {
      page,
      pageSize: Number(params?.page_size ?? 200),
      params,
      nextUrl: next ?? undefined,
    })
    result.push(...response.items)
    if (!response.next || visited.has(response.next) || result.length >= response.count) break
    if (page === 1000) {
      throw new Error('El listado supera el límite de páginas que puede consultar el frontend.')
    }
    visited.add(response.next)
    next = response.next
  }
  return result
}
