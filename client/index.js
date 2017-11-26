import Vue from 'vue'
import Copy from 'v-copy'
import App from './App.vue'
import router from './router'

Vue.use(Copy)

function syncQuery(Vue) {
  Vue.mixin({
    created() {
      const { syncDataToQuery: queryMap } = this.$options
      if (queryMap) {
        for (const dataKey in queryMap) {
        const queryKey = queryMap[dataKey]
        this.$watch(dataKey, () => {
          this.$router.push({
            query: {
              ...this.$route.query,
              [queryKey]: this[dataKey]
            }
          })
        })
      }
      }
    }
  })
}

Vue.use(syncQuery)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})