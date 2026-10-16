<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import styles from './restorePage.module.scss';
import actionButton from '@/assets/styles/actionButton.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import GapText from '@/components/GapText/gapText.vue';
import { getPassageById } from '@/api/getPassageById';
import type { TPassage } from '@/api/getPassages';
import { getGaps, parseGaps, type TGap, type TGapResult } from '@/composables/parseGaps';
import { declineUnit } from '@/composables/declineUnit';
import { appStore, archivePassage, spendInk } from '@/store/appStore';

type TStatus = 'idle' | 'errors' | 'noInk' | 'archived';

const route = useRoute();
const passage = ref< TPassage | null >( null );
const isLoaded = ref< boolean >( false );
const gapText = ref< InstanceType< typeof GapText > | null >( null );
const drafts = ref< ( string | null )[] >( [] );
const results = ref< TGapResult[] >( [] );
const isPrinting = ref< boolean >( false );
const status = ref< TStatus >( 'idle' );
const attempt = ref< number >( 0 ); // ключ GapText: новый лист — курсор и перемешивание заново

const gaps = computed( (): TGap[] => passage.value ? getGaps( parseGaps( passage.value.text )) : [] );

const resetSheet = () => {
  drafts.value = gaps.value.map( () => null );
  results.value = gaps.value.map( () => null );
  status.value = 'idle';
  attempt.value += 1;
};

getPassageById( String( route.params.id )).then( ( result: TPassage | null ) => {
  passage.value = result;
  isLoaded.value = true;
  resetSheet();
});

const hasPrinted = computed( (): boolean => results.value.some( ( result: TGapResult ) => result !== null ));
const printCost = computed( (): number => results.value.filter( ( result: TGapResult ) => result === null ).length );
const errorCount = computed( (): number => results.value.filter( ( result: TGapResult ) => result === 'wrong' ).length );

// На входе чернил должно хватать на весь абзац; после первой печати это уже не проверяется
const missingInk = computed( (): number => passage.value && !hasPrinted.value ? Math.max( 0, passage.value.gaps - appStore.ink ) : 0 );

const isReady = computed( (): boolean => {
  return !isPrinting.value
    && status.value !== 'archived'
    && drafts.value.length > 0
    && drafts.value.every( ( draft: string | null ) => draft !== null )
    && errorCount.value === 0;
});

const onPrint = async () => {
  if ( appStore.ink < printCost.value ) {
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

    spendInk( 1 );
    results.value = results.value.map( ( item: TGapResult, index: number ) => index === gap.index ? result : item );
  }

  await gapText.value?.parkHead();
  isPrinting.value = false;

  if ( errorCount.value > 0 ) {
    status.value = 'errors';

    return;
  }

  if ( passage.value ) {
    archivePassage( passage.value.id );
  }

  status.value = 'archived';
};
</script>

<template>
  <ion-page>
    <AppHeader :page-name="passage ? `«${ passage.work }»` : 'Реставрация'" />

    <ion-content :fullscreen="true" class="ion-padding">
      <p v-if="isLoaded && !passage">Абзац не найден.</p>

      <template v-if="passage">
        <InkLevel :class="styles.restorePage__ink" />

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
              :text="passage.text"
          />

          <p :class="styles.restorePage__source">{{ passage.author }}, «{{ passage.work }}»</p>

          <div :class="styles.restorePage__actions">
            <template v-if="status === 'archived'">
              <p :class="styles.restorePage__notice">Абзац отправлен в архив. Жетон знания +1.</p>
              <router-link to="/catalog">К каталогу</router-link>
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
              <p v-if="status === 'errors'" :class="styles.restorePage__notice">
                Ошибок: {{ errorCount }}. Исправь их и отдай на печать снова.
              </p>

              <button
                  :class="actionButton.actionButton"
                  :disabled="!isReady"
                  type="button"
                  @click="onPrint"
              >
                Отдать на печать
              </button>
            </template>
          </div>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>
