<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import styles from './homePage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import AppFooter from '@/components/AppFooter/appFooter.vue';
import SaelianMascot from '@/components/SaelianMascot/saelianMascot.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';

type THubLink = {
  to: string,
  title: string,
  meta: string,
};

const appVersion: string = __APP_VERSION__;

const links: THubLink[] = [
  { to: '/catalog', title: 'Реставрация', meta: 'Выбрать абзац для восстановления' },
  { to: '/archive', title: 'Архив', meta: 'Восстановленные абзацы' },
  { to: '/machine', title: 'Автомат чернил', meta: 'Наполнить чернильницу' },
  { to: '/achievements', title: 'Достижения', meta: 'Скоро' },
  { to: '/rules', title: 'Правила', meta: 'Справочник архивариуса' },
];
</script>

<template>
  <ion-page>
    <AppHeader is-home-page />

    <ion-content :fullscreen="true" class="ion-padding">
      <div :class="styles.homePage">
        <SaelianMascot :class="styles.homePage__mascot" autoplay emotion="smile" />

        <InkLevel />

        <nav :class="[ listCard.listCard, styles.homePage__links ]">
          <router-link
              v-for="link in links"
              :key="link.to"
              :class="listCard.listCard__item"
              :to="link.to"
          >
            <span :class="listCard.listCard__title">{{ link.title }}</span>
            <span :class="listCard.listCard__meta">{{ link.meta }}</span>
          </router-link>
        </nav>

        <p :class="styles.homePage__version">v{{ appVersion }}</p>

        <router-link to="/visor" :class="styles.homePage__visorLink">
          Эмоции визора
        </router-link>
      </div>
    </ion-content>

    <AppFooter />
  </ion-page>
</template>
