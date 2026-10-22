<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonContent, IonItem, IonLabel, IonPage } from '@ionic/vue';
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
import { groupPassages, type TAuthorGroup, type TWorkGroup } from '@/composables/groupPassages';
import { appStore } from '@/store/appStore';
import { appVars } from '@/configApp';
import UiProgressBar from '@/components/Ui/ProgressBar/uiProgressBar.vue';
import WidgetAuthorShort from '@/components/Widgets/Author/widgetAuthorShort.vue';

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


const isRestored = ( passage: TPassage ): boolean => appStore.restoredPassages.includes( passage.id );

const getProgress = ( list: TPassage[] ): string => `восстановлено ${ list.filter( isRestored ).length } из ${ list.length }`;

const getAuthorPassages = ( group: TAuthorGroup ): TPassage[] => group.works.flatMap( ( work: TWorkGroup ) => work.passages );

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

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-accordion-group :class="styles.catalogPage__authors" multiple>
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

          <ion-accordion-group slot="content" :class="styles.catalogPage__works" multiple>
            <ion-accordion v-for="work in group.works" :key="work.work" :value="work.work">
              <ion-item slot="header" :class="styles.catalogPage__header" lines="none">
                <ion-label>
                  <span :class="styles.catalogPage__work">«{{ work.work }}»</span>
                  <span :class="styles.catalogPage__progress">{{ getProgress( work.passages ) }}</span>
                </ion-label>
              </ion-item>

              <ul slot="content" :class="[ listCard.listCard, styles.catalogPage__passages ]">
                <li v-for="passage in work.passages" :key="passage.id">
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
