<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref } from 'vue';
import styles from './catalogPage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import { getPassages, type TPassage } from '@/api/getPassages';
import { declineUnit } from '@/composables/declineUnit';
import { appStore } from '@/store/appStore';

const passages = ref< TPassage[] >( [] );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
});

const getMissingInk = ( passage: TPassage ): number => Math.max( 0, passage.gaps - appStore.ink );

const getMeta = ( passage: TPassage ): string => {
  const missing: number = getMissingInk( passage );

  if ( missing > 0 ) {
    return `Не хватает ${ missing } ${ declineUnit( missing, 'drop' ) }`;
  }

  const restored: string = appStore.restoredPassages.includes( passage.id ) ? ' · в архиве' : '';

  return `${ passage.author } · ${ passage.gaps } ${ declineUnit( passage.gaps, 'drop' ) }${ restored }`;
};
</script>

<template>
  <ion-page>
    <AppHeader page-name="Реставрация" />

    <ion-content :fullscreen="true" class="ion-padding">
      <InkLevel :class="styles.catalogPage__ink" />

      <ul :class="listCard.listCard">
        <li v-for="passage in passages" :key="passage.id">
          <component
              :is="getMissingInk( passage ) > 0 ? 'div' : 'router-link'"
              :class="[ listCard.listCard__item, getMissingInk( passage ) > 0 && listCard.listCard__item_locked ]"
              :to="`/restore/${ passage.id }`"
          >
            <span :class="listCard.listCard__title">«{{ passage.work }}»</span>
            <span :class="listCard.listCard__meta">{{ getMeta( passage ) }}</span>
          </component>
        </li>
      </ul>
    </ion-content>
  </ion-page>
</template>
