import type { AxiosInstance, AxiosResponse } from 'axios'

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

function parsePage<T>(body: unknown): ParsedPage<T> {
  if (Array.isArray(body)) {
    return {
      items: body as T[],
      count: body.length,
      next: null,
      previous: null,
    }
  }

  if (!body || typeof body !== 'object') {
    return {
      items: [],
      count: 0,
      next: null,
      previous: null,
    }
  }

  const record = body as Record<string, unknown>
  const count = typeof record.count === 'number' ? record.count : 0
  const next = typeof record.next === 'string' ? record.next : null
  const previous = typeof record.previous === 'string' ? record.previous : null

  if (Array.isArray(record.data)) {
    return {
      items: record.data as T[],
      count: count || record.data.length,
      next,
      previous,
    }
  }

  if (Array.isArray(record.results)) {
    return {
      items: record.results as T[],
      count: count || record.results.length,
      next,
      previous,
    }
  }

  if (record.results && typeof record.results === 'object') {
    const nested = record.results as Record<string, unknown>

    if (Array.isArray(nested.data)) {
      return {
        items: nested.data as T[],
        count: count || nested.data.length,
        next,
        previous,
      }
    }

    if (Array.isArray(nested.results)) {
      return {
        items: nested.results as T[],
        count: count || nested.results.length,
        next,
        previous,
      }
    }
  }

  return {
    items: [],
    count,
    next,
    previous,
  }
}

export async function getBackendPage<T>(
  client: AxiosInstance,
  url: string,
  options?: {
    page?: number
    pageSize?: number
    params?: Record<string, string | number | boolean | undefined>
  },
): Promise<BackendPage<T>> {
  const page = Math.max(1, Number(options?.page ?? 1))
  const pageSize = Math.max(1, Number(options?.pageSize ?? 50))

  const response: AxiosResponse<unknown> = await client.get(url, {
    params: {
      ...options?.params,
      page,
      page_size: pageSize,
    },
  })

  const parsed = parsePage<T>(response.data)

  // Algunas vistas del backend usan una paginación fija de 50 y no aceptan
  // page_size. Cuando ocurre, el tamaño real se infiere desde la respuesta.
  const effectivePageSize =
    parsed.next && parsed.items.length > 0 ? parsed.items.length : pageSize

  return {
    items: parsed.items,
    count: parsed.count,
    page,
    pageSize: effectivePageSize,
    totalPages: Math.max(1, Math.ceil(parsed.count / Math.max(effectivePageSize, 1))),
    next: parsed.next,
    previous: parsed.previous,
  }
}

export async function getAllPages<T>(
  client: AxiosInstance,
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T[]> {
  const first = await getBackendPage<T>(client, url, {
    page: 1,
    pageSize: Number(params?.page_size ?? 200),
    params,
  })

  const items = [...first.items]

  if (!first.next || first.count <= first.items.length) {
    return items
  }

  const pageSize = Math.max(first.items.length || first.pageSize, 1)
  const totalPages = Math.ceil(first.count / pageSize)

  for (let page = 2; page <= totalPages && page <= 100; page += 1) {
    const response = await getBackendPage<T>(client, url, {
      page,
      pageSize,
      params,
    })

    items.push(...response.items)
  }

  return items
}
