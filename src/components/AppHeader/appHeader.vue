<script setup lang="ts">
import { IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import styles from './appHeader.module.scss';

const props = defineProps<{
  pageName?: string,
  isHomePage?: boolean,
}>();
</script>

<template>
  <ion-header :class="styles.appHeader" class="translucent-bar">
    <ion-toolbar>
      <ion-buttons slot="start" :class="styles.appHeader__leftPlaceholder">
        <ion-back-button
            v-if="!props.isHomePage"
            text="" defaultHref="/" :icon="arrowBack"
        ></ion-back-button>
      </ion-buttons>

      <div :class="styles.appHeader__title">
        <div v-if="props.pageName"
             v-html="props.pageName"
        />
        <template v-else>Чернильница</template>
      </div>
    </ion-toolbar>
  </ion-header>
</template>
