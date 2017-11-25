<template>
  <div class="page main-page">
    <div class="sidebar">
      <div class="select-from">
        <label for="">From</label>
        <select v-model="from">
          <option 
            :value="pair.from" 
            v-for="pair in PAIRS_GROUPED.from" 
            :key="pair.from">
            {{ pair.fromName }}
          </option>
        </select>
      </div>

      <div class="select-to" v-if="from">
        <label for="">To</label>
        <select v-model="to">
          <option 
            :value="pair.to" 
            v-for="pair in getPairsByFrom(from)"
            :key="pair.to">
            {{ pair.toName }}
          </option>  
        </select>
      </div>

      <div v-if="from === 'babel' && to === 'js'" class="transform-options">
        <label class="label">
          <input type="checkbox" v-model="transformOptions.es2015" /> ES2015
        </label>
        <label class="label">
          <input type="checkbox" v-model="transformOptions.es2016" /> ES2016
        </label>
        <label class="label">
          <input type="checkbox" v-model="transformOptions.es2017" /> ES2017
        </label>
      </div>

      <div class="controls">
        <button :disabled="procesing" type="button" @click="handleTransform">
          {{ processing ? 'Processing...' : 'Transform' }}
        </button>
      </div>
      <div>version: <a href="https://github.com/egoist/transform.cool">{{ websiteVersion }}</a></div>
    </div>

    <div class="main">
      <div class="editor input-editor">
        <code-mirror v-model="input" :options="inputEditorOptions"></code-mirror>
      </div>
      <div class="editor output-editor">
        <code-mirror v-model="output" :options="outputEditorOptions"></code-mirror>
      </div>
    </div>
  </div>
</template>

<script>
import CodeMirror from 'vue-cm'
import axios from 'axios'
import dedupe from 'dedupe'
import notie from 'notie'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx'

const PAIRS = [
  {
    from: 'babel',
    to: 'js',
    fromLang: 'text/javascript',
    toLang: 'text/javascript',
    fromName: 'Babel',
    toName: 'JavaScript',
    transformOptions: {
      es2015: true,
      es2016: true,
      es2017: true
    }
  },
  {
    from: 'buble',
    to: 'js',
    fromLang: 'text/javascript',
    toLang: 'text/javascript',
    fromName: 'Buble',
    toName: 'JavaScript'
  },
  {
    from: 'react',
    to: 'vue',
    fromLang: 'jsx',
    toLang: 'jsx',
    fromName: 'React',
    toName: 'Vue'
  }
]

const PAIRS_GROUPED = {
  from: dedupe(PAIRS, p => p.from), // @todo: dedupe by "from"
  to: dedupe(PAIRS, p => p.to) // @todo: dedupe by "to"
}

export default {
  data() {
    return {
      from: '',
      to: '',
      input: '',
      output: '',
      editorOptions: {
        mode: 'javascript'
      },
      websiteVersion: process.env.WEBSITE_VERSION,
      PAIRS_GROUPED,
      transformOptions: null,
      processing: false
    }
  },

  watch: {
    matchedPair() {
      this.transformOptions = this.matchedPair.transformOptions
    }
  },

  computed: {
    matchedPair() {
      if (!this.from || !this.to) return null

      return PAIRS.filter(p => p.from === this.from && p.to === this.to)[0]
    },

    inputEditorOptions() {
      if (!this.matchedPair) return {}

      return {
        mode: this.matchedPair.fromLang
      }
    },

    outputEditorOptions() {
      if (!this.matchedPair) return {}

      return {
        mode: this.matchedPair.toLang
      }
    }
  },

  methods: {
    async handleTransform() {
      this.processing = true
      const { output, message } = await axios({
        method: 'POST',
        url: `${process.env.API_URL}/transform`,
        data: {
          from: this.from,
          to: this.to,
          input: this.input,
          transformOptions: this.transformOptions
        }
      }).then(res => res.data)
      if (message) {
        notie.alert({
          type: 'error',
          text: message,
          stay: true
        })
      } else {
        this.output = output
      }
      this.processing = false
    },

    getPairsByFrom(from) {
      return PAIRS.filter(p => p.from === from)
    }
  },

  components: {
    CodeMirror
  }
}
</script>

<style src="notie/dist/notie.min.css"></style>
<style src="codemirror/lib/codemirror.css"></style>
<style scoped lang="stylus">
.sidebar
  width: 260px
  border-right: 1px solid #e2e2e2
  height: 100%
  padding: 10px
  .label
    display: block

.main
  width: calc(100% - 260px)
  display: flex
  .editor
    width: 50%
    &:first-child
      border-right: 1px solid #e2e2e2

.main-page
  display: flex
</style>

<style lang="stylus">
.CodeMirror
  height: 100%
</style>

