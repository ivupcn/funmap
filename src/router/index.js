import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/poi/:id',
    name: 'PoiDetail',
    component: () => import('@/views/PoiDetailView.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
  },
  {
    path: '/panorama',
    name: 'Panorama',
    component: () => import('@/views/PanoramaView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
