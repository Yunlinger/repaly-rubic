<template>
  <codemirror
    ref="codemirror"
    :value="value"
    class="source-code-editor"
    :options="getOption()"
    @input="onCmCodeChange"
  />
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'

// 折叠
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'

export default {
  name: 'SourceEditor',
  components: {
    codemirror
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'text/javascript'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cmOption: {
        tabSize: 4,
        indentUnit: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: this.mode, // 'text/x-c++src',
        theme: 'base16-dark',
        viewportMargin: Infinity,
        // 折叠
        autoCloseBrackets: true,
        foldGutter: true,
        lineWrapping: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
      },
      editor: null
    }
  },
  mounted() {
    this.clear()
  },
  beforeDestroy() {
    this.editor = null
  },
  methods: {
    clear() {
      this.editor = this.$refs.codemirror.codemirror
      // 清除之前的高亮
      const doc = this.editor.getDoc()
      doc.getAllMarks().forEach(mark => mark.clear())
    },
    serch(value) {
      this.clear()
      if (value === '') return
      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
      }
      let key = escapeRegExp(value)
      const searchRegex = new RegExp(key, 'g')
      // 获取文本内容
      const doc = this.editor.getDoc()
      const text = doc.getValue()
      // 搜索匹配的关键词并进行高亮
      let match
      while ((match = searchRegex.exec(text))) {
        const start = doc.posFromIndex(match.index)
        const end = doc.posFromIndex(match.index + match[0].length)
        this.editor.markText(start, end, { className: 'search-highlight' }) // 设置匹配文本的样式类名
      }
    },
    getOption() {
      return {
        ... this.cmOption,
        mode: this.mode,
        readOnly: this.readOnly
      }
    },
    onCmCodeChange(newValue) {
      this.$emit('change', newValue)
      this.$emit('input', newValue)
    }
  }
}
</script>

<style lang="scss">
  .source-code-editor {
    .CodeMirror {
      font-size: 14px;
      height: 100%;
      min-height: 20px;
    }
  }
  .search-highlight {
    color: #000 !important;
    background-color: #FFD700;
  }
</style>

