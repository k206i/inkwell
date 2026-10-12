import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomePage/homePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  }
]

// Страница подбора эмоций визора: только для разработки, в релизную сборку не попадает
if ( import.meta.env.DEV ) {
  routes.push( {
    path: '/visor',
    name: 'Visor',
    component: () => import( '@/views/VisorPage/visorPage.vue' )
  } );
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
