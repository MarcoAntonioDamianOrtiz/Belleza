export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Record<string, string[] | string>
}

export type ApiListResponse<T> = ApiResponse<T[]> | T[]
