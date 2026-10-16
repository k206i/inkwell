<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import styles from './achievementsPage.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
</script>

<template>
  <ion-page>
    <AppHeader page-name="Достижения" />

    <ion-content :fullscreen="true" class="ion-padding">
      <p :class="styles.achievementsPage__empty">Скоро здесь появятся достижения архивариуса.</p>
    </ion-content>
  </ion-page>
</template>
