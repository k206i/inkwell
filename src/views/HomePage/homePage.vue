<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import styles from './homePage.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import AppFooter from '@/components/AppFooter/appFooter.vue';

const appVersion: string = __APP_VERSION__;
const isDev: boolean = import.meta.env.DEV;
</script>

<template>
  <ion-page>
    <AppHeader is-home-page />

    <ion-content :fullscreen="true" class="ion-padding">
      <div :class="styles.homePage">
        <img
            :class="styles.homePage__mascot"
            src="@/assets/img/emotions/saelian_think.webp"
            alt="Саэлиан"
        />

        <p :class="styles.homePage__version">v{{ appVersion }}</p>

        <router-link v-if="isDev" to="/visor" :class="styles.homePage__visorLink">
          Эмоции визора
        </router-link>
      </div>
    </ion-content>

    <AppFooter />
  </ion-page>
</template>
