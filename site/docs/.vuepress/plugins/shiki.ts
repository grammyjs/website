import { createDefaultMapFromNodeModules } from '@typescript/vfs'
import type MarkdownIt from 'markdown-it'
import { setupForFile, transformAttributesToHTML } from 'remark-shiki-twoslash'
import type { UserConfigSettings } from 'shiki-twoslash'

export default (settings: UserConfigSettings) => ({
  name: 'vuepress-plugin-shiki-twoslash',
  extendsMarkdown: async (md: MarkdownIt) => {
    const { highlighters } = await setupForFile(settings)
    md.options.highlight = (code, lang, attrs) => {
      code = code.replace(/\r?\n$/, '') // strip trailing newline fed during code block parsing
      return transformAttributesToHTML(
        code,
        [lang, attrs].join(' '),
        highlighters,
        {
          // Loads type definitions from installed libraries
          // We can inject other type definitions as shown here:
          // https://github.com/microsoft/TypeScript-Website/issues/513#issuecomment-613522891
          fsMap: createDefaultMapFromNodeModules({}),
          ...settings
        }!
      )
    }
  }
})
