<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import styles from './gapText.module.scss';
import PaperSheet from '@/components/PaperSheet/paperSheet.vue';
import { getGaps, getOptionLabel, parseGaps, type TGap, type TGapResult, type TTextPart } from '@/composables/parseGaps';
import { shuffle } from '@/composables/shuffle';

const props = defineProps<{
  text: string,
  carriage?: boolean,
  disabled?: boolean, // во время печати выбор закрыт
}>();

// null — пропуск ещё не заполнен
const drafts = defineModel< ( string | null )[] >( 'drafts', { required: true });
const results = defineModel< TGapResult[] >( 'results', { default: () => [] });

const sheet = ref< InstanceType< typeof PaperSheet > | null >( null );
const parts = computed( (): TTextPart[] => parseGaps( props.text ));
const gaps = computed( (): TGap[] => getGaps( parts.value ));
const shuffledOptions = computed( (): string[][] => gaps.value.map( ( gap: TGap ) => shuffle( gap.options )));
const active = ref< number >( 0 );
const activeGap = computed( (): TGap | null => props.disabled ? null : gaps.value[active.value] ?? null );

// Открыт для выбора пустой пропуск и напечатанный с ошибкой
const isOpen = ( index: number, draftList: ( string | null )[], resultList: TGapResult[] ): boolean => {
  return draftList[index] === null || resultList[index] === 'wrong';
};

const findOpen = ( from: number, draftList: ( string | null )[], resultList: TGapResult[] ): number => {
  const total: number = gaps.value.length;

  for ( let step = 0; step < total; step++ ) {
    const index: number = ( from + step ) % total;

    if ( isOpen( index, draftList, resultList )) {
      return index;
    }
  }

  return -1;
};

watch( () => props.text, () => {
  active.value = 0;
});

// После печати курсор встаёт на первую ошибку
watch( results, ( resultList: TGapResult[] ) => {
  if ( !isOpen( active.value, drafts.value, resultList )) {
    active.value = findOpen( 0, drafts.value, resultList );
  }
});

const onSelect = ( index: number ) => {
  if ( props.disabled || results.value[index] === 'right' ) {
    return;
  }

  active.value = index;
};

const onChoose = ( option: string ) => {
  // Новые массивы считаем здесь: значения моделей обновятся только после ответа родителя
  const nextDrafts: ( string | null )[] = drafts.value.map( ( draft: string | null, index: number ) => index === active.value ? option : draft );
  const nextResults: TGapResult[] = results.value.map( ( result: TGapResult, index: number ) => index === active.value ? null : result );

  drafts.value = nextDrafts;

  if ( results.value[active.value] ) {
    results.value = nextResults;
  }

  active.value = findOpen( active.value + 1, nextDrafts, nextResults );
};

defineExpose({
  moveHeadTo: ( index: number ): Promise< void > => sheet.value?.moveHeadTo( index ) ?? Promise.resolve(),
  parkHead: (): Promise< void > => sheet.value?.parkHead() ?? Promise.resolve(),
});
</script>

<template>
  <div :class="styles.gapText">
    <PaperSheet
        ref="sheet"
        :active="activeGap ? active : -1"
        :carriage="props.carriage"
        :drafts="drafts"
        :parts="parts"
        :results="results"
        @select="onSelect"
    />

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
