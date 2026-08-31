import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const isDarkMode = ref(false)
  const themeInitialized = ref(false)

  function applyTheme() {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = isDarkMode.value ? 'dark' : 'light'
    document.documentElement.style.colorScheme = isDarkMode.value ? 'dark' : 'light'
  }

  function initializeTheme() {
    if (themeInitialized.value || typeof window === 'undefined') return

    const savedTheme = window.localStorage.getItem('belleza-theme')
    isDarkMode.value = savedTheme === 'dark'
    themeInitialized.value = true
    applyTheme()
  }

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    applyTheme()

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('belleza-theme', isDarkMode.value ? 'dark' : 'light')
    }
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  return {
    sidebarOpen,
    isDarkMode,
    initializeTheme,
    toggleTheme,
    toggleSidebar,
    closeSidebar,
  }
})
