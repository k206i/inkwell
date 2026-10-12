<script setup lang="ts">
import styles from './appFooter.module.scss';
import { IonFooter, IonToolbar } from '@ionic/vue';
</script>

<template>
  <ion-footer :class="styles.appFooter" class="translucent-bar">
    <ion-toolbar>
      💜
      <span :class="styles.appFooter__thanks">
        Спасибо всем, кто поддерживает приложение
      </span>
    </ion-toolbar>
  </ion-footer>
</template>
