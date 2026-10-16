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
import { getGaps, parseGaps } from '@/composables/parseGaps';
import { declineUnit } from '@/composables/declineUnit';
import { appStore } from '@/store/appStore';

const route = useRoute();
const passage = ref< TPassage | null >( null );
const isLoaded = ref< boolean >( false );
const drafts = ref< ( string | null )[] >( [] );
const isPrintRequested = ref< boolean >( false );

getPassageById( String( route.params.id )).then( ( result: TPassage | null ) => {
  passage.value = result;
  drafts.value = result ? getGaps( parseGaps( result.text )).map( () => null ) : [];
  isLoaded.value = true;
});

const isFilled = computed( (): boolean => drafts.value.length > 0 && drafts.value.every( ( draft: string | null ) => draft !== null ));
const missingInk = computed( (): number => passage.value ? Math.max( 0, passage.value.gaps - appStore.ink ) : 0 );
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
          <GapText v-model:drafts="drafts" :text="passage.text" />

          <p :class="styles.restorePage__source">{{ passage.author }}, «{{ passage.work }}»</p>

          <div :class="styles.restorePage__actions">
            <button
                :class="actionButton.actionButton"
                :disabled="!isFilled"
                type="button"
                @click="isPrintRequested = true"
            >
              Отдать на печать
            </button>

            <p v-if="isPrintRequested" :class="styles.restorePage__notice">
              Каретка с чернильницей появится на следующем шаге.
            </p>
          </div>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>
