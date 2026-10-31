<script setup lang="ts">
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { waterOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import styles from './restorePage.module.scss';
import actionButton from '@/assets/styles/actionButton.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import GapText, { type TSaePhrase } from '@/components/GapText/gapText.vue';
import { getPassageById } from '@/api/getPassageById';
import type { TPassage } from '@/api/getPassages';
import { getAuthors, getPassageSource, type TAuthor, type TPassageSource } from '@/api/getAuthors';
import { getGaps, parseGaps, type TGap, type TGapResult } from '@/composables/parseGaps';
import { declineUnit } from '@/composables/declineUnit';
import { appStore, archivePassage, recordAnswer, spendInk } from '@/store/appStore';

type TStatus = 'idle' | 'errors' | 'noInk' | 'archived';

const route = useRoute();
const passage = ref< TPassage | null >( null );
const isLoaded = ref< boolean >( false );
const gapText = ref< InstanceType< typeof GapText > | null >( null );
const panel = ref< HTMLElement | null >( null );
const drafts = ref< ( string | null )[] >( [] );
const results = ref< TGapResult[] >( [] );
const isPrinting = ref< boolean >( false );
const status = ref< TStatus >( 'idle' );
const isTokenEarned = ref< boolean >( false );
const attempt = ref< number >( 0 ); // ключ GapText: новый лист — курсор и перемешивание заново
const printedGaps: Set< number > = new Set(); // в статистику идёт только первая печать пропуска на листе

const gaps = computed( (): TGap[] => passage.value ? getGaps( parseGaps( passage.value.text )) : [] );

const resetSheet = () => {
  drafts.value = gaps.value.map( () => null );
  results.value = gaps.value.map( () => null );
  status.value = 'idle';
  attempt.value += 1;
  printedGaps.clear();
};

getPassageById( String( route.params.id )).then( ( result: TPassage | null ) => {
  passage.value = result;
  isLoaded.value = true;
  resetSheet();
});

const authors = ref< TAuthor[] >( [] );

getAuthors().then( ( result: TAuthor[] ) => {
  authors.value = result;
});

const source = computed( (): TPassageSource | null => passage.value ? getPassageSource( authors.value, passage.value ) : null );

// Ionic держит страницу в стеке, поэтому при повторном входе после архива лист очищаем сами
onIonViewWillEnter( () => {
  if ( status.value === 'archived' ) {
    resetSheet();
  }
});

const hasPrinted = computed( (): boolean => results.value.some( ( result: TGapResult ) => result !== null ));
const printCost = computed( (): number => results.value.filter( ( result: TGapResult ) => result === null ).length );
const errorCount = computed( (): number => results.value.filter( ( result: TGapResult ) => result === 'wrong' ).length );
const emptyCount = computed( (): number => drafts.value.filter( ( draft: string | null ) => draft === null ).length );

// «Остался 1 пропуск», «Осталось 3 пропуска»
const remainingLabel = computed( (): string => {
  const count: number = emptyCount.value;
  const verb: string = count % 10 === 1 && count % 100 !== 11 ? 'Остался' : 'Осталось';

  return `${ verb } ${ count } ${ declineUnit( count, 'gap' ) }`;
});

// Реплика Саэ в облачке, пока активного пропуска нет
const saePhrase = computed( (): TSaePhrase | undefined => {
  if ( isPrinting.value ) {
    return { text: 'Печатаю…' };
  }

  if ( status.value === 'archived' ) {
    return { text: isTokenEarned.value ? 'Готово! Абзац в архиве.' : 'Готово, абзац снова в архиве.' };
  }

  if ( status.value === 'noInk' ) {
    return { text: 'Чернил не хватит. Начнём заново?' };
  }

  return emptyCount.value === 0 ? { text: 'Печатаем?', emotion: 'curiosity' } : undefined;
});

// Повтор абзаца из архива — чистая практика без жетона, поэтому и чернила на него не тратятся
const isReplay = computed( (): boolean => passage.value ? appStore.restoredPassages.includes( passage.value.id ) : false );

// На входе чернил должно хватать на весь абзац; после первой печати это уже не проверяется
const missingInk = computed( (): number => {
  if ( !passage.value || hasPrinted.value || isReplay.value ) {
    return 0;
  }

  return Math.max( 0, passage.value.gaps - appStore.ink );
});

const isReady = computed( (): boolean => {
  return !isPrinting.value
    && status.value !== 'archived'
    && drafts.value.length > 0
    && drafts.value.every( ( draft: string | null ) => draft !== null )
    && errorCount.value === 0;
});

const onPrint = async () => {
  if ( !isReplay.value && appStore.ink < printCost.value ) {
    status.value = 'noInk';

    return;
  }

  isPrinting.value = true;
  status.value = 'idle';

  // Каретка проходит всю страницу, а печатает только черновики
  for ( const gap of gaps.value ) {
    await gapText.value?.moveHeadTo( gap.index );

    if ( results.value[gap.index] !== null ) {
      continue;
    }

    const result: TGapResult = drafts.value[gap.index] === gap.answer ? 'right' : 'wrong';

    if ( !isReplay.value ) {
      spendInk( 1 );
    }

    results.value = results.value.map( ( item: TGapResult, index: number ) => index === gap.index ? result : item );

    if ( !printedGaps.has( gap.index )) {
      printedGaps.add( gap.index );
      recordAnswer( gap.ruleId, result === 'right', true );
    }
  }

  await gapText.value?.parkHead();
  isPrinting.value = false;

  if ( errorCount.value > 0 ) {
    status.value = 'errors';

    return;
  }

  isTokenEarned.value = passage.value ? archivePassage( passage.value.id ) : false;
  status.value = 'archived';
};
</script>

<template>
  <ion-page>
    <AppHeader page-name="Реставрация" />

    <ion-content :fullscreen="true" :scroll-y="false">
      <div :class="styles.restorePage">
        <div :class="styles.restorePage__text">
          <p v-if="isLoaded && !passage">Абзац не найден.</p>

          <template v-if="passage">
            <div :class="styles.restorePage__title">
              {{ source?.book?.title }}
            </div>

            <p v-if="isReplay && status !== 'archived'" :class="[ styles.restorePage__notice, styles.restorePage__replay ]">
              Повтор: чернила не тратятся.
            </p>

            <p v-if="missingInk > 0" :class="styles.restorePage__notice">
              Для этого абзаца не хватает {{ missingInk }} {{ declineUnit( missingInk, 'drop' ) }}.
              <router-link to="/machine">К автомату чернил</router-link>
            </p>

            <template v-else>
              <GapText
                  ref="gapText"
                  :key="attempt"
                  v-model:drafts="drafts"
                  v-model:results="results"
                  carriage
                  :disabled="isPrinting || status === 'archived'"
                  :finished="status === 'archived'"
                  :panel-target="panel"
                  :phrase="saePhrase"
                  :text="passage.text"
              />

              <p :class="styles.restorePage__source">{{ source?.author?.short }}, «{{ source?.book?.title }}»</p>
            </template>
          </template>
        </div>

        <div v-if="passage && missingInk === 0" :class="styles.restorePage__panel">
          <div ref="panel" />

          <div :class="styles.restorePage__actions">
            <template v-if="status === 'archived'">
              <div :class="styles.restorePage__token">
                <span
                    :class="[ styles.restorePage__tokenCoin, { [styles.restorePage__tokenCoin_received]: !isTokenEarned } ]"
                    aria-hidden="true"
                >§</span>

                <span :class="[ styles.restorePage__tokenText, { [styles.restorePage__tokenText_received]: !isTokenEarned } ]">
                  {{ isTokenEarned ? 'Жетон знания +1' : 'Жетон знания уже получен' }}
                </span>
              </div>

              <router-link :class="[ actionButton.actionButton, styles.restorePage__print ]" to="/catalog">
                К каталогу
              </router-link>
            </template>

            <template v-else-if="status === 'noInk'">
              <p :class="styles.restorePage__notice">
                На печать нужно {{ printCost }} {{ declineUnit( printCost, 'drop' ) }}, а в чернильнице {{ appStore.ink }}.
                Абзац придётся начать заново.
              </p>

              <button :class="actionButton.actionButton" type="button" @click="resetSheet">
                Начать заново
              </button>
            </template>

            <template v-else>
              <button
                  v-if="emptyCount > 0"
                  :class="[ actionButton.actionButton, actionButton.actionButton_dashed, styles.restorePage__print ]"
                  disabled
                  type="button"
              >
                {{ remainingLabel }}
              </button>

              <button
                  v-else-if="errorCount > 0"
                  :class="[ actionButton.actionButton, actionButton.actionButton_dashed, styles.restorePage__print ]"
                  disabled
                  type="button"
              >
                Исправь ошибки: {{ errorCount }}
              </button>

              <button
                  v-else
                  :class="[ actionButton.actionButton, styles.restorePage__print ]"
                  :disabled="!isReady"
                  type="button"
                  @click="onPrint"
              >
                Вписать набело

                <span v-if="!isReplay" :class="styles.restorePage__price">
                  <ion-icon :icon="waterOutline" />
                  {{ printCost }}
                </span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
