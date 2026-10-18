import DefaultTheme from 'vitepress/theme'
import FamilyTree from './components/FamilyTree.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FamilyTree', FamilyTree)
  }
}
