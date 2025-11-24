import { createRouter, createWebHistory } from 'vue-router'
import GiftRecommendationView from '../views/GiftRecommendationView.vue'
import BondCalculatorView from '../views/BondCalculatorView.vue'

const routes = [
  {
    path: '/',
    redirect: '/gift-recommendation',
  },
  {
    path: '/gift-recommendation',
    name: 'GiftRecommendation',
    component: GiftRecommendationView,
  },
  {
    path: '/bond-calculator',
    name: 'BondCalculator',
    component: BondCalculatorView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
