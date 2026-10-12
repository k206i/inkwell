<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';

const appVersion: string = __APP_VERSION__;
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding">
      <h1>Чернильница</h1>
      <p>v{{ appVersion }}</p>
    </ion-content>
  </ion-page>
</template>
