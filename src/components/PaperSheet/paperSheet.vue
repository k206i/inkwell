<script setup lang="ts">
import { computed, ref } from 'vue';
import styles from './paperSheet.module.scss';
import type { TGap, TGapResult, TTextPart } from '@/composables/parseGaps';

const props = defineProps<{
  parts: TTextPart[],
  drafts: ( string | null )[],
  results: TGapResult[],
  active: number,
  carriage?: boolean,
}>();

const emit = defineEmits<{
  select: [ index: number ],
}>();

// Шаг каретки от пропуска к пропуску: длинный абзац печатается быстрее, но не мельтешит
const STEP_MIN: number = 150;
const STEP_MAX: number = 450;
const STEP_TOTAL: number = 6000;

const gapElements: HTMLElement[] = [];
const headX = ref< number >( 0 );
const headY = ref< number >( 0 );
const isParked = ref< boolean >( true );

const gapCount = computed( (): number => props.parts.filter( ( part: TTextPart ) => part.kind === 'gap' ).length );
const step = computed( (): number => Math.min( STEP_MAX, Math.max( STEP_MIN, STEP_TOTAL / Math.max( 1, gapCount.value ))));

const setGapElement = ( index: number, element: unknown ) => {
  if ( element instanceof HTMLElement ) {
    gapElements[index] = element;
  }
};

const wait = ( ms: number ): Promise< void > => new Promise( ( resolve ) => window.setTimeout( resolve, ms ));

const moveHeadTo = async ( index: number ): Promise< void > => {
  const element: HTMLElement | undefined = gapElements[index];

  if ( !element ) {
    return;
  }

  headX.value = element.offsetLeft + element.offsetWidth / 2;
  headY.value = element.offsetTop + element.offsetHeight / 2;
  isParked.value = false;

  await wait( step.value );
};

const parkHead = async (): Promise< void > => {
  isParked.value = true;

  await wait( step.value );
};

defineExpose({ moveHeadTo, parkHead });

const gapClass = ( gap: TGap ): string[] => {
  const draft: string | null = props.drafts[gap.index] ?? null;
  const result: TGapResult = props.results[gap.index] ?? null;
  const classes: string[] = [];

  if ( gap.index === props.active ) {
    classes.push( styles.paperSheet__gap_active );
  }

  if ( result ) {
    classes.push( result === 'right' ? styles.paperSheet__gap_right : styles.paperSheet__gap_wrong );
  }

  if ( draft === null ) {
    return [ ...classes, styles.paperSheet__gap_empty ];
  }

  if ( draft === '' ) {
    return [ ...classes, styles.paperSheet__gap_nothing ];
  }

  if ( draft === ' ' ) {
    return [ ...classes, styles.paperSheet__gap_space ];
  }

  return [ ...classes, styles.paperSheet__gap_letter ];
};
</script>

<template>
  <div :class="styles.paperSheet" :style="{ '--step': `${ step }ms` }">
    <p :class="styles.paperSheet__text">
      <template v-for="( part, index ) in props.parts" :key="index">
        <span v-if="part.kind === 'text'">{{ part.value }}</span>
        <button
            v-else
            :ref="( element ) => setGapElement( part.gap.index, element )"
            :class="[ styles.paperSheet__gap, ...gapClass( part.gap ) ]"
            :disabled="props.results[part.gap.index] === 'right'"
            type="button"
            @click="emit( 'select', part.gap.index )"
        >{{ props.drafts[part.gap.index] ?? '' }}</button>
      </template>
    </p>

    <div v-if="props.carriage" :class="styles.paperSheet__carriage" aria-hidden="true">
      <span :class="[ styles.paperSheet__rail, styles.paperSheet__rail_left ]" />
      <span :class="[ styles.paperSheet__rail, styles.paperSheet__rail_right ]" />

      <span :class="styles.paperSheet__bar" :style="{ top: isParked ? '0px' : `${ headY }px` }">
        <span :class="styles.paperSheet__head" :style="{ left: isParked ? '50%' : `${ headX }px` }" />
      </span>
    </div>
  </div>
</template>
