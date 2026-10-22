<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, ref } from 'vue';
import styles from './archivePage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import { getPassages, type TPassage } from '@/api/getPassages';
import { getAuthors, type TAuthor } from '@/api/getAuthors';
import { fillGaps, getGaps, parseGaps, type TGap, type TTextPart } from '@/composables/parseGaps';
import { appStore } from '@/store/appStore';

const passages = ref< TPassage[] >( [] );
const opened = ref< TPassage | null >( null );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
});

const authors = ref< TAuthor[] >( [] );

getAuthors().then( ( result: TAuthor[] ) => {
  authors.value = result;
});

const getAuthorName = ( passage: TPassage ): string => authors.value.find( ( author: TAuthor ) => author.id === passage.authorId )?.short ?? '';

const restored = computed( (): TPassage[] => passages.value.filter( ( passage: TPassage ) => appStore.restoredPassages.includes( passage.id )));

const openedText = computed( (): string => {
  if ( !opened.value ) {
    return '';
  }

  const parts: TTextPart[] = parseGaps( opened.value.text );

  return fillGaps( parts, getGaps( parts ).map( ( gap: TGap ) => gap.answer ));
});
</script>

<template>
  <ion-page>
    <AppHeader page-name="Архив" />

    <ion-content :fullscreen="true" class="ion-padding">
      <ul v-if="restored.length" :class="listCard.listCard">
        <li v-for="passage in restored" :key="passage.id">
          <button
              :class="[ listCard.listCard__item, styles.archivePage__item ]"
              type="button"
              @click="opened = passage"
          >
            <span :class="listCard.listCard__title">{{ passage.title }}</span>
            <span :class="listCard.listCard__meta">{{ getAuthorName( passage ) }}, «{{ passage.work }}»</span>
          </button>
        </li>
      </ul>

      <p v-else :class="styles.archivePage__empty">
        Здесь появятся восстановленные абзацы.
        <router-link to="/catalog">К реставрации</router-link>
      </p>

      <ion-modal :is-open="opened !== null" @did-dismiss="opened = null">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ opened ? `«${ opened.work }»` : '' }}</ion-title>

            <ion-buttons slot="end">
              <ion-button @click="opened = null">Закрыть</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <template v-if="opened">
            <p :class="styles.archivePage__paper">{{ openedText }}</p>
            <p :class="styles.archivePage__source">{{ getAuthorName( opened ) }}, «{{ opened.work }}»</p>
          </template>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>
