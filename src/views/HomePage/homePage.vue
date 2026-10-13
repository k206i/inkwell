<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import styles from './homePage.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import AppFooter from '@/components/AppFooter/appFooter.vue';
import SaelianMascot from '@/components/SaelianMascot/saelianMascot.vue';

const appVersion: string = __APP_VERSION__;
</script>

<template>
  <ion-page>
    <AppHeader is-home-page />

    <ion-content :fullscreen="true" class="ion-padding">
      <div :class="styles.homePage">
        <SaelianMascot :class="styles.homePage__mascot" autoplay emotion="smile" />

        <p :class="styles.homePage__version">v{{ appVersion }}</p>

        <router-link to="/visor" :class="styles.homePage__visorLink">
          Эмоции визора
        </router-link>
      </div>
    </ion-content>

    <AppFooter />
  </ion-page>
</template>
