import Vue from 'vue'
import Router from 'vue-router'

import MainPage from '../views/MainPage.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: MainPage
    }
  ]
})

export default router