import { ref } from 'vue'

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value: string, endOfDay = false) {
  if (!value) return null

  const parts = value.split('-')
  if (parts.length !== 3) return null

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return date
}

export function getDatePresetRange(preset: 'today' | '7days' | '30days' | 'month') {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const from = new Date(today)
  const to = new Date(today)

  if (preset === '7days') from.setDate(from.getDate() - 6)
  if (preset === '30days') from.setDate(from.getDate() - 29)
  if (preset === 'month') from.setDate(1)

  return {
    from: toInputDate(from),
    to: toInputDate(to),
  }
}

export function useDateRangeFilter(
  defaultPreset: 'today' | '7days' | '30days' | 'month' = '30days',
) {
  const initial = getDatePresetRange(defaultPreset)
  const dateFrom = ref(initial.from)
  const dateTo = ref(initial.to)

  function matchesDate(value: string | null | undefined) {
    if (!value) return false

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return false

    const from = parseInputDate(dateFrom.value)
    const to = parseInputDate(dateTo.value, true)

    if (from && date < from) return false
    if (to && date > to) return false

    return true
  }

  return {
    dateFrom,
    dateTo,
    matchesDate,
  }
}
