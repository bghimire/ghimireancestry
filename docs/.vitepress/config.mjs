import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ghimire Ancestry',
  description: 'Family history and genealogy',
  base: '/ghimireancestry/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ]
  }
})
