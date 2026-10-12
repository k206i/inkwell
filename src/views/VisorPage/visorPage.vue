<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref } from 'vue';
import styles from './visorPage.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import VisorEmotion from '@/components/Visor/visorEmotion.vue';
import { visorFaces, type TVisorEmotion } from '@/components/Visor/visorFaces';

const names: Record<TVisorEmotion, string> = {
  neutral: 'Нейтрально',
  joy: 'Радость',
  happiness: 'Счастье',
  delight: 'Восторг',
  laughter: 'Смех',
  smile: 'Улыбка',
  calm: 'Спокойствие',
  sadness: 'Грусть',
  anger: 'Злость',
  irritation: 'Раздражение',
  rage: 'Ярость',
  tiredness: 'Усталость',
  boredom: 'Скука',
  shock: 'Шок',
  surprise: 'Удивление',
  interest: 'Интерес',
  love: 'Влюблённость',
  curiosity: 'Любопытство',
  sleep: 'Сон',
  overload: 'Перегрузка',
  confusion: 'Непонятно',
  noise: 'Шум',
};

const emotions: TVisorEmotion[] = Object.keys( visorFaces ) as TVisorEmotion[];
const current = ref<TVisorEmotion>( 'neutral' );

const onNext = () => {
  const index: number = emotions.indexOf( current.value );

  current.value = emotions[( index + 1 ) % emotions.length];
};
</script>

<template>
  <ion-page>
    <AppHeader page-name="Эмоции <span class='accent-theme'>визора</span>" />

    <ion-content :fullscreen="true" class="ion-padding">
      <button :class="styles.visorPage__main" type="button" @click="onNext">
        <span :class="styles.visorPage__screen">
          <VisorEmotion :emotion="current" />
        </span>
        {{ names[current] }}
      </button>

      <div :class="styles.visorPage__grid">
        <button
            v-for="emotion in emotions"
            :key="emotion"
            :class="styles.visorPage__item"
            type="button"
            @click="current = emotion"
        >
          <span :class="styles.visorPage__screen">
            <VisorEmotion :emotion="emotion" />
          </span>
          {{ names[emotion] }}
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>
