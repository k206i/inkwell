<script setup lang="ts">
import styles from './visorEmotion.module.scss';
import { visorFaces, type TVisorEmotion } from './visorFaces';

const props = defineProps<{
  emotion: TVisorEmotion,
}>();
</script>

<template>
  <svg :class="styles.visorEmotion" viewBox="0 0 140 100" aria-hidden="true">
    <!-- d задаётся через style: CSS-переход плавно меняет форму только у свойства, не у атрибута -->
    <path
        v-for="( stroke, index ) in visorFaces[props.emotion]"
        :key="index"
        :class="styles.visorEmotion__stroke"
        :style="`d: path( '${ stroke.d }' ); stroke-dasharray: ${ stroke.dash }`"
    />
  </svg>
</template>
