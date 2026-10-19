<script setup lang="ts">
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/vue';
import { arrowBack, homeOutline } from 'ionicons/icons';
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

      <!-- root очищает стек страниц: иначе круги «каталог → абзац → главная» копились бы в «назад» -->
      <ion-buttons v-if="!props.isHomePage" slot="end">
        <ion-button aria-label="На главную" router-direction="root" router-link="/home">
          <ion-icon slot="icon-only" :icon="homeOutline" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>
