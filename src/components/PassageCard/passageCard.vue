<script lang="ts">
export type TPassageCardState = 'available' | 'archived' | 'locked';
</script>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { lockClosedOutline, waterOutline } from 'ionicons/icons';
import { computed } from 'vue';
import styles from './passageCard.module.scss';
import type { TPassage } from '@/api/getPassages';
import { declineUnit } from '@/composables/declineUnit';
import { appVars } from '@/configApp';

const props = defineProps<{
  passage: TPassage,
  state: TPassageCardState,
  missingInk: number,
}>();

const maxDifficulty: number = appVars.catalog.maxDifficulty;
const pips: number[] = Array.from( { length: maxDifficulty }, ( _item: unknown, index: number ) => index + 1 );
const difficulty = computed( (): number => Math.min( maxDifficulty, Math.ceil( props.passage.gaps / appVars.catalog.gapsPerDifficulty )));
</script>

<template>
  <component
      :is="props.state === 'locked' ? 'div' : 'router-link'"
      :class="[ styles.passageCard, props.state === 'locked' && styles.passageCard_locked ]"
      :to="`/restore/${ props.passage.id }`"
  >
    <span :class="styles.passageCard__title">{{ props.passage.title }}</span>

    <span v-if="props.state === 'archived'" :class="styles.passageCard__stamp">В архиве</span>

    <span :class="styles.passageCard__footer">
      <span :class="styles.passageCard__rule" aria-hidden="true" />

      <span v-if="props.state === 'locked'" :class="styles.passageCard__lack">
        <ion-icon :icon="lockClosedOutline" aria-hidden="true" />
        Не хватает {{ props.missingInk }} {{ declineUnit( props.missingInk, 'drop' ) }}
      </span>

      <span v-else :class="styles.passageCard__info">
        <span
            :aria-label="`${ props.passage.gaps } ${ declineUnit( props.passage.gaps, 'gap' ) }`"
            :class="styles.passageCard__gaps"
        >
          <ion-icon :icon="waterOutline" aria-hidden="true" />
          {{ props.passage.gaps }}
        </span>

        <span :aria-label="`Сложность ${ difficulty } из ${ maxDifficulty }`" :class="styles.passageCard__pips" role="img">
          <span
              v-for="pip in pips"
              :key="pip"
              :class="[ styles.passageCard__pip, pip <= difficulty && styles.passageCard__pip_filled ]"
          />
        </span>
      </span>

      <span v-if="props.state === 'archived'" :class="styles.passageCard__free">Повтор бесплатно</span>
    </span>

    <span :class="styles.passageCard__hole" aria-hidden="true" />
  </component>
</template>
