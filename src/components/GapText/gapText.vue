<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import styles from './gapText.module.scss';
import { getGaps, getOptionLabel, parseGaps, type TGap, type TTextPart } from '@/composables/parseGaps';
import { shuffle } from '@/composables/shuffle';

const props = defineProps<{
  text: string,
}>();

// null — пропуск ещё не заполнен
const drafts = defineModel< ( string | null )[] >( 'drafts', { required: true });

const parts = computed( (): TTextPart[] => parseGaps( props.text ));
const gaps = computed( (): TGap[] => getGaps( parts.value ));
const shuffledOptions = computed( (): string[][] => gaps.value.map( ( gap: TGap ) => shuffle( gap.options )));
const active = ref< number >( 0 );
const activeGap = computed( (): TGap | null => gaps.value[active.value] ?? null );

watch( () => props.text, () => {
  active.value = 0;
});

const gapClass = ( gap: TGap ): string[] => {
  const draft: string | null = drafts.value[gap.index];
  const classes: string[] = gap.index === active.value ? [ styles.gapText__gap_active ] : [];

  if ( draft === null ) {
    return [ ...classes, styles.gapText__gap_empty ];
  }

  if ( draft === '' ) {
    return [ ...classes, styles.gapText__gap_nothing ];
  }

  if ( draft === ' ' ) {
    return [ ...classes, styles.gapText__gap_space ];
  }

  return [ ...classes, styles.gapText__gap_draft ];
};

const onChoose = ( option: string ) => {
  // Новый массив считаем здесь: значение модели обновится только после ответа родителя
  const next: ( string | null )[] = drafts.value.map( ( draft: string | null, index: number ) => index === active.value ? option : draft );
  const total: number = next.length;

  drafts.value = next;

  for ( let step = 1; step <= total; step++ ) {
    const index: number = ( active.value + step ) % total;

    if ( next[index] === null ) {
      active.value = index;

      return;
    }
  }

  active.value = -1;
};
</script>

<template>
  <div :class="styles.gapText">
    <p :class="styles.gapText__text">
      <template v-for="( part, index ) in parts" :key="index">
        <span v-if="part.kind === 'text'">{{ part.value }}</span>
        <button
            v-else
            :class="[ styles.gapText__gap, ...gapClass( part.gap ) ]"
            type="button"
            @click="active = part.gap.index"
        >{{ drafts[part.gap.index] ?? '' }}</button>
      </template>
    </p>

    <div v-if="activeGap" :class="styles.gapText__panel">
      <div :class="styles.gapText__options">
        <button
            v-for="option in shuffledOptions[activeGap.index]"
            :key="option"
            :class="styles.gapText__option"
            type="button"
            @click="onChoose( option )"
        >{{ getOptionLabel( option ) }}</button>
      </div>

      <router-link
          v-if="activeGap.ruleId"
          :class="styles.gapText__rule"
          :to="`/rules/${ activeGap.ruleId }`"
      >
        Почему так?
      </router-link>
    </div>
  </div>
</template>
