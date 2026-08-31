import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useClientPagination<T>(source: MaybeRefOrGetter<T[]>, pageSize = 10) {
  const page = ref(1)

  const totalItems = computed(() => toValue(source).length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

  const paginatedItems = computed(() => {
    const items = toValue(source)
    const start = (page.value - 1) * pageSize
    return items.slice(start, start + pageSize)
  })

  function goToPage(nextPage: number) {
    page.value = Math.min(Math.max(nextPage, 1), totalPages.value)
  }

  watch(
    () => toValue(source),
    () => {
      page.value = 1
    },
  )

  watch(totalPages, () => {
    if (page.value > totalPages.value) {
      page.value = totalPages.value
    }
  })

  return {
    page,
    totalItems,
    totalPages,
    paginatedItems,
    goToPage,
  }
}
