// Replaces the Nuxt 2 Vuex store, which only ever held the selected card theme.
// useState gives the same shared, SSR-safe reactive value without a store layer.
export const useTheme = () => useState('theme', () => 1)
