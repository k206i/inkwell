<script lang="ts">
import type { TVisorEmotion } from '@/components/Visor/visorFaces';

export type TSaePhrase = {
  text: string,
  emotion?: TVisorEmotion,
};
</script>

<script setup lang="ts">
import { IonContent, IonIcon, IonModal } from '@ionic/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { computed, ref, watch } from 'vue';
import styles from './gapText.module.scss';
import PaperSheet from '@/components/PaperSheet/paperSheet.vue';
import VisorEmotion from '@/components/Visor/visorEmotion.vue';
import UiProgressBar from '@/components/Ui/ProgressBar/uiProgressBar.vue';
import { getGaps, getOptionLabel, parseGaps, type TGap, type TGapResult, type TTextPart } from '@/composables/parseGaps';
import { shuffle } from '@/composables/shuffle';
import { getRules, type TRule } from '@/api/getRules';

const props = defineProps<{
  text: string,
  carriage?: boolean,
  disabled?: boolean, // во время печати выбор закрыт
  panelTarget?: HTMLElement | null,
  phrase?: TSaePhrase, // реплика Саэ в облачке, когда активного пропуска нет
  finished?: boolean, // абзац восстановлен: стрелки и клавиши больше не нужны
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
const hintRule = ref< TRule | null >( null );
const isHintOpen = ref< boolean >( false );
const rules = ref< TRule[] >( [] );

getRules().then( ( result: TRule[] ) => {
  rules.value = result;
});

const activeRule = computed( (): TRule | null => rules.value.find( ( rule: TRule ) => rule.id === activeGap.value?.ruleId ) ?? null );

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

// Стрелки ходят по тем же пропускам, что открываются нажатием на лист: всем, кроме напечатанных верно
const findSelectable = ( from: number, direction: number ): number => {
  for ( let index = from; index >= 0 && index < gaps.value.length; index += direction ) {
    if ( results.value[index] !== 'right' ) {
      return index;
    }
  }

  return -1;
};

// Без курсора стрелки ведут к последнему и первому доступному пропуску
const prevIndex = computed( (): number => findSelectable( ( active.value === -1 ? gaps.value.length : active.value ) - 1, -1 ));
const nextIndex = computed( (): number => findSelectable( active.value + 1, 1 ));
// Во время печати стрелки не убираем, а гасим: иначе закреплённая панель прыгает по высоте
const hasNav = computed( (): boolean => gaps.value.length > 1 );
const filledCount = computed( (): number => drafts.value.filter( ( draft: string | null ) => draft !== null ).length );
const isFilled = computed( (): boolean => filledCount.value === gaps.value.length );
const shownPhrase = computed( (): TSaePhrase | null => activeGap.value ? null : props.phrase ?? null );

const emotion = computed( (): TVisorEmotion => {
  if ( shownPhrase.value?.emotion ) {
    return shownPhrase.value.emotion;
  }

  if ( props.finished ) {
    return 'love';
  }

  if ( !props.disabled && results.value.includes( 'wrong' )) {
    return 'confusion';
  }

  return isFilled.value ? 'smile' : 'interest';
});

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

const onRule = () => {
  hintRule.value = activeRule.value;
  isHintOpen.value = hintRule.value !== null;
};

defineExpose({
  moveHeadTo: ( index: number ): Promise< void > => sheet.value?.moveHeadTo( index ) ?? Promise.resolve(),
  parkHead: (): Promise< void > => sheet.value?.parkHead() ?? Promise.resolve(),
  strike: ( isWrong: boolean ): Promise< void > => sheet.value?.strike( isWrong ) ?? Promise.resolve(),
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

    <Teleport :disabled="!props.panelTarget" :to="props.panelTarget">
      <div :class="styles.gapText__panel">
        <UiProgressBar
            v-if="false"
            :class="[ styles.gapText__progressBar, { [styles.gapText__progressBar_finished]: props.finished } ]"
            :total="gaps.length"
            :value="filledCount"
        />

        <div :class="styles.gapText__sae">
          <div :class="styles.gapText__mascot">
            <img
                :class="styles.gapText__mascotImage"
                src="@/assets/img/saelian/saelian_min.webp"
                alt="Саэлиан"
            />

            <div :class="styles.gapText__visor">
              <VisorEmotion :emotion="emotion" />
            </div>
          </div>

          <div :class="styles.gapText__hint">
            <button
                v-if="activeRule"
                :class="styles.gapText__cloud"
                type="button"
                @click="onRule"
            >
              <span :class="styles.gapText__ruleSign" aria-hidden="true">§</span>
              <span :class="styles.gapText__ruleTitle">{{ activeRule.title }}</span>
              <ion-icon :class="styles.gapText__ruleArrow" :icon="chevronForward" />
            </button>

            <div v-else-if="shownPhrase" :class="styles.gapText__cloud">
              {{ shownPhrase.text }}
            </div>
          </div>
        </div>

        <div v-if="!props.finished && ( activeGap || hasNav )" :class="styles.gapText__row">
          <button
              v-if="hasNav"
              :class="styles.gapText__arrow"
              :disabled="props.disabled || prevIndex === -1"
              aria-label="Предыдущий пропуск"
              type="button"
              @click="onSelect( prevIndex )"
          >
            <ion-icon :icon="chevronBack" />
          </button>

          <div v-if="activeGap" :class="styles.gapText__options">
            <button
                v-for="option in shuffledOptions[activeGap.index]"
                :key="option"
                :class="styles.gapText__option"
                type="button"
                @click="onChoose( option )"
            >{{ getOptionLabel( option, activeGap.options ) }}</button>
          </div>

          <button
              v-if="hasNav"
              :class="styles.gapText__arrow"
              :disabled="props.disabled || nextIndex === -1"
              aria-label="Следующий пропуск"
              type="button"
              @click="onSelect( nextIndex )"
          >
            <ion-icon :icon="chevronForward" />
          </button>
        </div>
      </div>
    </Teleport>

    <ion-modal
        :breakpoints="[ 0, 0.4, 0.8 ]"
        :initial-breakpoint="0.4"
        :is-open="isHintOpen"
        @did-dismiss="isHintOpen = false"
    >
      <ion-content class="ion-padding">
        <template v-if="hintRule">
          <h2 :class="styles.gapText__hintTitle">{{ hintRule.title }}</h2>
          <p>{{ hintRule.hint }}</p>

          <router-link :to="`/rules/${ hintRule.id }`" @click="isHintOpen = false">
            Подробнее
          </router-link>
        </template>
      </ion-content>
    </ion-modal>
  </div>
</template>
