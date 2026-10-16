<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import styles from './machineTaskPage.module.scss';
import actionButton from '@/assets/styles/actionButton.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import GapText from '@/components/GapText/gapText.vue';
import { getRuleById } from '@/api/getRuleById';
import type { TRule } from '@/api/getRules';
import { fillGaps, getGaps, parseGaps, type TGap, type TTextPart } from '@/composables/parseGaps';
import { declineUnit } from '@/composables/declineUnit';
import { addInk, appStore } from '@/store/appStore';
import { appVars } from '@/configApp';

type TResult = 'idle' | 'right' | 'wrong';

const route = useRoute();
const rule = ref< TRule | null >( null );
const isLoaded = ref< boolean >( false );
const questionIndex = ref< number >( 0 );
const attempt = ref< number >( 0 ); // ключ GapText: новый вопрос — новое перемешивание вариантов
const drafts = ref< ( string | null )[] >( [] );
const result = ref< TResult >( 'idle' );
const earned = ref< number >( 0 );

const question = computed( (): string => rule.value?.questions[questionIndex.value] ?? '' );
const parts = computed( (): TTextPart[] => parseGaps( question.value ));
const gaps = computed( (): TGap[] => getGaps( parts.value ));
const answerText = computed( (): string => fillGaps( parts.value, gaps.value.map( ( gap: TGap ) => gap.answer )));
const isFilled = computed( (): boolean => drafts.value.length > 0 && drafts.value.every( ( draft: string | null ) => draft !== null ));

const resetQuestion = () => {
  drafts.value = gaps.value.map( () => null );
  result.value = 'idle';
  attempt.value += 1;
};

getRuleById( String( route.params.ruleId )).then( ( found: TRule | null ) => {
  rule.value = found;
  isLoaded.value = true;
  resetQuestion();
});

const onAnswer = () => {
  const isRight: boolean = gaps.value.every( ( gap: TGap ) => drafts.value[gap.index] === gap.answer );

  if ( !isRight ) {
    result.value = 'wrong';

    return;
  }

  const before: number = appStore.ink;

  addInk( appVars.machine.dropsPerAnswer );
  earned.value = appStore.ink - before;
  result.value = 'right';
};

const onNext = () => {
  questionIndex.value = ( questionIndex.value + 1 ) % ( rule.value?.questions.length ?? 1 );
  resetQuestion();
};
</script>

<template>
  <ion-page>
    <AppHeader page-name="Автомат чернил" />

    <ion-content :fullscreen="true" class="ion-padding">
      <p v-if="isLoaded && !rule">Задание не найдено.</p>

      <template v-if="rule">
        <InkLevel :class="styles.machineTaskPage__ink" />

        <section :class="styles.machineTaskPage__rule">
          <h2 :class="styles.machineTaskPage__title">{{ rule.title }}</h2>
          <p v-for="( paragraph, index ) in rule.text" :key="index">{{ paragraph }}</p>
        </section>

        <GapText :key="attempt" v-model:drafts="drafts" :text="question" />

        <div :class="styles.machineTaskPage__actions">
          <button
              v-if="result === 'idle'"
              :class="actionButton.actionButton"
              :disabled="!isFilled"
              type="button"
              @click="onAnswer"
          >
            Ответить
          </button>

          <template v-else>
            <p v-if="result === 'right'" :class="styles.machineTaskPage__result">
              Верно!
              <template v-if="earned > 0">+{{ earned }} {{ declineUnit( earned, 'drop' ) }}</template>
              <template v-else>Чернильница полна.</template>
            </p>

            <p v-else :class="styles.machineTaskPage__result">
              Неверно. Правильно: {{ answerText }}
              <router-link :to="`/rules/${ rule.id }`">Перечитать правило</router-link>
            </p>

            <button :class="actionButton.actionButton" type="button" @click="onNext">
              Дальше
            </button>
          </template>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>
