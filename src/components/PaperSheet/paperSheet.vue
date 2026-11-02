<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import styles from './paperSheet.module.scss';
import PrintCarriage from '@/components/PrintCarriage/printCarriage.vue';
import { groupWords, type TGap, type TGapResult, type TTextPart, type TWordChunk } from '@/composables/parseGaps';

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
const printCarriage = ref< InstanceType< typeof PrintCarriage > | null >( null );

const words = computed( (): TWordChunk[] => groupWords( props.parts ));
const gapCount = computed( (): number => props.parts.filter( ( part: TTextPart ) => part.kind === 'gap' ).length );
const step = computed( (): number => Math.min( STEP_MAX, Math.max( STEP_MIN, STEP_TOTAL / Math.max( 1, gapCount.value ))));

// «Ничего» в пропуске посреди слова смыкает его части
const innerGaps = computed( (): Set< number > => new Set( words.value.flatMap( ( chunk: TWordChunk ) => {
  return chunk.kind === 'word' ? chunk.parts.slice( 1, -1 ).flatMap( ( part: TTextPart ) => part.kind === 'gap' ? [ part.gap.index ] : [] ) : [];
})));

const setGapElement = ( index: number, element: unknown ) => {
  if ( element instanceof HTMLElement ) {
    gapElements[index] = element;
  }
};

// Курсор докручиваем, только если он ушёл за край текста, а пропуск под кареткой держим посередине
const scrollToGap = ( index: number, block: ScrollLogicalPosition ) => {
  gapElements[index]?.scrollIntoView({ block, behavior: 'smooth' });
};

watch( () => props.active, ( index: number ) => scrollToGap( index, 'nearest' ));

const moveHeadTo = async ( index: number ): Promise< void > => {
  const element: HTMLElement | undefined = gapElements[index];

  if ( !element ) {
    return;
  }

  scrollToGap( index, 'center' );

  await printCarriage.value?.moveTo( element.offsetLeft + element.offsetWidth / 2, element.offsetTop + element.offsetHeight / 2 );
};

defineExpose({
  moveHeadTo,
  parkHead: (): Promise< void > => printCarriage.value?.park() ?? Promise.resolve(),
  strike: ( isWrong: boolean ): Promise< void > => printCarriage.value?.strike( isWrong ) ?? Promise.resolve(),
});

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

const gapLabel = ( gap: TGap ): string => {
  const draft: string | null = props.drafts[gap.index] ?? null;

  if ( draft === '' ) {
    return innerGaps.value.has( gap.index ) ? '‿' : '□';
  }

  if ( draft === ' ' ) {
    return '|';
  }

  return draft ?? '';
};
</script>

<template>
  <div :class="[ styles.paperSheet, { [styles.paperSheet_carriage]: props.carriage } ]">
    <p :class="styles.paperSheet__text">
      <template v-for="( chunk, index ) in words" :key="index">
        <template v-if="chunk.kind === 'space'">{{ chunk.value }}</template>
        <span v-else :class="styles.paperSheet__word">
          <template v-for="( part, partIndex ) in chunk.parts" :key="partIndex">
            <template v-if="part.kind === 'text'">{{ part.value }}</template>
            <button
                v-else
                :ref="( element ) => setGapElement( part.gap.index, element )"
                :class="[ styles.paperSheet__gap, ...gapClass( part.gap ) ]"
                :disabled="props.results[part.gap.index] === 'right'"
                type="button"
                @click="emit( 'select', part.gap.index )"
            >{{ gapLabel( part.gap ) }}</button>
          </template>
        </span>
      </template>
    </p>

    <PrintCarriage v-if="props.carriage" ref="printCarriage" :step="step" />
  </div>
</template>
