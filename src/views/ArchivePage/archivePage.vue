<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import styles from './archivePage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import { getPassages, type TPassage } from '@/api/getPassages';
import { appStore } from '@/store/appStore';

const passages = ref< TPassage[] >( [] );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
});

const restored = computed( (): TPassage[] => passages.value.filter( ( passage: TPassage ) => appStore.restoredPassages.includes( passage.id )));
</script>

<template>
  <ion-page>
    <AppHeader page-name="Архив" />

    <ion-content :fullscreen="true" class="ion-padding">
      <ul v-if="restored.length" :class="listCard.listCard">
        <li v-for="passage in restored" :key="passage.id" :class="listCard.listCard__item">
          <span :class="listCard.listCard__title">«{{ passage.work }}»</span>
          <span :class="listCard.listCard__meta">{{ passage.author }}</span>
        </li>
      </ul>

      <p v-else :class="styles.archivePage__empty">
        Здесь появятся восстановленные абзацы.
        <router-link to="/catalog">К реставрации</router-link>
      </p>
    </ion-content>
  </ion-page>
</template>
