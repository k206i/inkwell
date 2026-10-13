<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import styles from './saelianMascot.module.scss';
import VisorEmotion from '@/components/Visor/visorEmotion.vue';
import { visorFaces, type TVisorEmotion } from '@/components/Visor/visorFaces';

const AUTOPLAY_INTERVAL: number = 2000;

const props = defineProps<{
  emotion: TVisorEmotion,
  autoplay?: boolean,
}>();

const emotions: TVisorEmotion[] = Object.keys( visorFaces ) as TVisorEmotion[];
const current = ref<TVisorEmotion>( props.emotion );

watch( () => props.emotion, ( value: TVisorEmotion ) => {
  current.value = value;
});

const onTick = () => {
  const index: number = emotions.indexOf( current.value );

  current.value = emotions[( index + 1 ) % emotions.length];
};

watchEffect( ( onCleanup ) => {
  if ( !props.autoplay ) {
    return;
  }

  const timer: number = window.setInterval( onTick, AUTOPLAY_INTERVAL );

  onCleanup( () => window.clearInterval( timer ) );
});
</script>

<template>
  <div :class="styles.saelianMascot">
    <img
        :class="styles.saelianMascot__image"
        src="@/assets/img/saelian/sae_cross.webp"
        alt="Саэлиан"
    />

    <div :class="styles.saelianMascot__visor">
      <VisorEmotion :emotion="current" />
    </div>
  </div>
</template>
