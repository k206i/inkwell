<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { bookOutline, chevronDown, chevronForward } from 'ionicons/icons';
import { computed, ref } from 'vue';
import styles from './widgetBookName.module.scss';
import UiProgressBar from '@/components/Ui/ProgressBar/uiProgressBar.vue';
import { getAuthors, type TAuthor, type TAuthorBook } from '@/api/getAuthors';
import { getPassages, type TPassage } from '@/api/getPassages';
import { getBookProgress } from '@/composables/getBookProgress';
import { appStore } from '@/store/appStore';
import { sessionStore } from '@/store/sessionStore';

const props = defineProps<{
  bookId: string,
  selectable?: boolean, // стрелка справа: на телефоне раскрывает книгу, на планшете выбирает
  selected?: boolean,
}>();

const book = ref< TAuthorBook | null >( null );
const passageIds = ref< string[] >( [] );

getAuthors().then( ( authors: TAuthor[] ) => {
  book.value = authors
    .flatMap( ( author: TAuthor ) => author.books )
    .find( ( item: TAuthorBook ) => item.id === props.bookId ) ?? null;
});

getPassages().then( ( passages: TPassage[] ) => {
  passageIds.value = passages
    .filter( ( passage: TPassage ) => passage.bookId === props.bookId )
    .map( ( passage: TPassage ) => passage.id );
});

const restoredCount = computed( (): number => passageIds.value.filter( ( id: string ) => appStore.restoredPassages.includes( id )).length );
</script>

<template>
  <div :class="[ styles.widgetBookName, { [styles.widgetBookName_selected]: props.selected && sessionStore.isWide } ]">
    <div :class="styles.widgetBookName__icon">
      <ion-icon :icon="bookOutline" />
    </div>

    <div :class="styles.widgetBookName__content">
      <div :class="styles.widgetBookName__title">
        {{ book?.title }}
      </div>

      <div :class="styles.widgetBookName__comment">
        {{ getBookProgress( passageIds.length, restoredCount ) }}
      </div>

      <UiProgressBar
          :class="styles.widgetBookName__progressBar"
          :total="passageIds.length"
          :value="restoredCount"
      />
    </div>

    <ion-icon
        v-if="props.selectable"
        :class="[ styles.widgetBookName__arrow, {
          [styles.widgetBookName__arrow_flipped]: props.selected && !sessionStore.isWide,
          [styles.widgetBookName__arrow_hidden]: !props.selected && sessionStore.isWide,
        } ]"
        :icon="sessionStore.isWide ? chevronForward : chevronDown"
    />
  </div>
</template>
