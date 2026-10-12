<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import AppFooter from '@/components/AppFooter/appFooter.vue';

const appVersion: string = __APP_VERSION__;
</script>

<template>
  <ion-page>
    <AppHeader is-home-page />

    <ion-content :fullscreen="true" class="ion-padding">
      <h1>Чернильница</h1>
      <p>v{{ appVersion }}</p>
    </ion-content>

    <AppFooter />
  </ion-page>
</template>
