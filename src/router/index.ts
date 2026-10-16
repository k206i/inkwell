import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomePage/homePage.vue';
import CatalogPage from '@/views/CatalogPage/catalogPage.vue';
import RestorePage from '@/views/RestorePage/restorePage.vue';
import ArchivePage from '@/views/ArchivePage/archivePage.vue';
import InkMachinePage from '@/views/InkMachinePage/inkMachinePage.vue';
import MachineTaskPage from '@/views/MachineTaskPage/machineTaskPage.vue';
import AchievementsPage from '@/views/AchievementsPage/achievementsPage.vue';
import RulesPage from '@/views/RulesPage/rulesPage.vue';
import RulePage from '@/views/RulePage/rulePage.vue';
import VisorPage from '@/views/VisorPage/visorPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: CatalogPage
  },
  {
    path: '/restore/:id',
    name: 'Restore',
    component: RestorePage
  },
  {
    path: '/archive',
    name: 'Archive',
    component: ArchivePage
  },
  {
    path: '/machine',
    name: 'InkMachine',
    component: InkMachinePage
  },
  {
    path: '/machine/:ruleId',
    name: 'MachineTask',
    component: MachineTaskPage
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: AchievementsPage
  },
  {
    path: '/rules',
    name: 'Rules',
    component: RulesPage
  },
  {
    path: '/rules/:id',
    name: 'Rule',
    component: RulePage
  },
  {
    path: '/visor',
    name: 'Visor',
    component: VisorPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
