<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonContent, IonIcon, IonItem, IonLabel, IonPage, type AccordionGroupCustomEvent } from '@ionic/vue';
import { bookOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import styles from './catalogPage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import PassageCard, { type TPassageCardState } from '@/components/PassageCard/passageCard.vue';
import { getPassages, type TPassage } from '@/api/getPassages';
import { getRules, type TRule } from '@/api/getRules';
import { getAuthors, type TAuthor } from '@/api/getAuthors';
import { getPassageRules } from '@/composables/getPassageRules';
import { groupPassages, type TAuthorGroup, type TBookGroup } from '@/composables/groupPassages';
import { appStore } from '@/store/appStore';
import { appVars } from '@/configApp';
import UiProgressBar from '@/components/Ui/ProgressBar/uiProgressBar.vue';
import WidgetAuthorShort from '@/components/Widgets/Author/widgetAuthorShort.vue';
import WidgetBookName from '@/components/Widgets/Book/widgetBookName.vue';
import { sessionStore } from '@/store/sessionStore';
import { getBookProgress } from '@/composables/getBookProgress';

const passages = ref< TPassage[] >( [] );
const rules = ref< TRule[] >( [] );
const authors = ref< TAuthor[] >( [] );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
});

getAuthors().then( ( result: TAuthor[] ) => {
  authors.value = result;
});

getRules().then( ( result: TRule[] ) => {
  rules.value = result;
});

const ruleShorts = computed( (): Map< string, string > => new Map( rules.value
  .filter( ( rule: TRule ) => !appVars.catalog.hiddenRuleSections.includes( rule.section ))
  .map( ( rule: TRule ): [ string, string ] => [ rule.id, rule.short ] )));

const getRuleShorts = ( passage: TPassage ): string[] => getPassageRules( passage.text )
  .flatMap( ( ruleId: string ): string[] => {
    const short: string | undefined = ruleShorts.value.get( ruleId );

    return short ? [ short ] : [];
  });

const groups = computed( (): TAuthorGroup[] => groupPassages( passages.value, authors.value ));

// Раскрытые авторы и книги общие для обеих раскладок, поэтому переживают поворот экрана
const openAuthorIds = ref< string[] >( [] );
const openBookIds = ref< string[] >( [] );

const onAuthorsChange = ( event: AccordionGroupCustomEvent< string[] > ) => {
  // Сюда же всплывает событие вложенной группы книг
  if ( event.target !== event.currentTarget ) {
    return;
  }

  openAuthorIds.value = event.detail.value;
};

const onBooksChange = ( event: AccordionGroupCustomEvent< string[] > ) => {
  openBookIds.value = event.detail.value;
};

// Ionic дописывает раскрытую книгу в конец списка, её и показываем справа
const selectedBook = computed( (): TBookGroup | null => {
  const id: string | undefined = openBookIds.value.at( -1 );

  return groups.value
    .flatMap( ( group: TAuthorGroup ) => group.books )
    .find( ( book: TBookGroup ) => book.book.id === id ) ?? null;
});


const isRestored = ( passage: TPassage ): boolean => appStore.restoredPassages.includes( passage.id );

const getProgress = ( list: TPassage[] ): string => `восстановлено ${ list.filter( isRestored ).length } из ${ list.length }`;

const getAuthorPassages = ( group: TAuthorGroup ): TPassage[] => group.books.flatMap( ( book: TBookGroup ) => book.passages );

// Повтор абзаца из архива бесплатный, поэтому чернилами он не закрывается
const getMissingInk = ( passage: TPassage ): number => isRestored( passage ) ? 0 : Math.max( 0, passage.gaps - appStore.ink );

const getState = ( passage: TPassage ): TPassageCardState => {
  if ( getMissingInk( passage ) > 0 ) {
    return 'locked';
  }

  return isRestored( passage ) ? 'archived' : 'available';
};
</script>

<template>
  <ion-page>
    <AppHeader page-name="Реставрация" />

    <ion-content :class="{ 'ion-padding': !sessionStore.isWide }" :fullscreen="true" :scroll-y="!sessionStore.isWide">
      <div v-if="sessionStore.isWide" :class="styles.catalogPage__wide">
        <div :class="styles.catalogPage__aside">
          <ion-accordion-group :value="openAuthorIds" multiple @ion-change="onAuthorsChange">
            <ion-accordion v-for="group in groups" :key="group.author.id" :value="group.author.id">
              <ion-item slot="header" :class="styles.catalogPage__header" lines="none">
                <ion-label>
                  <WidgetAuthorShort
                      :author-id="group.author.id"
                      :comment="getProgress( getAuthorPassages( group ))"
                  />

                  <UiProgressBar
                      :class="styles.catalogPage__progressBar"
                      :total="getAuthorPassages( group ).length"
                      :value="getAuthorPassages( group ).filter( isRestored ).length"
                  />
                </ion-label>
              </ion-item>

              <div slot="content" :class="styles.catalogPage__asideBooks">
                <button
                    v-for="book in group.books"
                    :key="book.book.id"
                    :class="styles.catalogPage__bookButton"
                    type="button"
                    @click="openBookIds = [ book.book.id ]"
                >
                  <WidgetBookName
                      :book-id="book.book.id"
                      selectable
                      :selected="book.book.id === selectedBook?.book.id"
                  />
                </button>
              </div>
            </ion-accordion>
          </ion-accordion-group>
        </div>

        <div v-if="selectedBook" :class="styles.catalogPage__main">
          <div :class="styles.catalogPage__bookTitle">
            {{ selectedBook.book.title }}
          </div>

          <div :class="styles.catalogPage__bookProgress">
            {{ getBookProgress( selectedBook.passages.length, selectedBook.passages.filter( isRestored ).length ) }}
          </div>

          <ul :class="[ listCard.listCard, styles.catalogPage__passages ]">
            <li v-for="passage in selectedBook.passages" :key="passage.id">
              <PassageCard
                  :missing-ink="getMissingInk( passage )"
                  :passage="passage"
                  :rules="getRuleShorts( passage )"
                  :state="getState( passage )"
              />
            </li>
          </ul>
        </div>

        <div v-else :class="[ styles.catalogPage__main, styles.catalogPage__empty ]">
          <ion-icon :icon="bookOutline" />
        </div>
      </div>

      <ion-accordion-group
          v-else
          :class="styles.catalogPage__authors"
          :value="openAuthorIds"
          multiple
          @ion-change="onAuthorsChange"
      >
        <ion-accordion v-for="group in groups" :key="group.author.id" :value="group.author.id">
          <ion-item slot="header" :class="styles.catalogPage__header" lines="none">
            <ion-label>
              <WidgetAuthorShort
                  :author-id="group.author.id"
                  :comment="getProgress( getAuthorPassages( group ))"
              />

              <UiProgressBar
                  :class="styles.catalogPage__progressBar"
                  :total="getAuthorPassages( group ).length"
                  :value="getAuthorPassages( group ).filter( isRestored ).length"
              />
            </ion-label>
          </ion-item>

          <ion-accordion-group
              slot="content"
              :class="styles.catalogPage__books"
              :value="openBookIds"
              multiple
              @ion-change="onBooksChange"
          >
            <ion-accordion v-for="book in group.books" :key="book.book.id" :value="book.book.id">
              <ion-item slot="header" :class="[ styles.catalogPage__header, styles.catalogPage__bookHeader ]" lines="none">
                <WidgetBookName
                    :class="styles.catalogPage__book"
                    :book-id="book.book.id"
                    selectable
                    :selected="openBookIds.includes( book.book.id )"
                />
              </ion-item>

              <ul slot="content" :class="[ listCard.listCard, styles.catalogPage__passages ]">
                <li v-for="passage in book.passages" :key="passage.id">
                  <PassageCard
                      :missing-ink="getMissingInk( passage )"
                      :passage="passage"
                      :rules="getRuleShorts( passage )"
                      :state="getState( passage )"
                  />
                </li>
              </ul>
            </ion-accordion>
          </ion-accordion-group>
        </ion-accordion>
      </ion-accordion-group>
    </ion-content>
  </ion-page>
</template>
