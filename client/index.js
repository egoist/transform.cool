import Vue from 'vue'
import Copy from 'v-copy'
import App from './App.vue'
import router from './router'

Vue.use(Copy)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})