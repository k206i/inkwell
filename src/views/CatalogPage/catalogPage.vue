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
import { getPassageRules } from '@/composables/getPassageRules';
import { groupPassages, type TAuthorGroup, type TWorkGroup } from '@/composables/groupPassages';
import { appStore } from '@/store/appStore';
import { appVars } from '@/configApp';

const passages = ref< TPassage[] >( [] );
const rules = ref< TRule[] >( [] );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
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

const groups = computed( (): TAuthorGroup[] => groupPassages( passages.value ));

// При входе авторы раскрыты, произведения свёрнуты
const openAuthors = computed( (): string[] => groups.value.map( ( group: TAuthorGroup ) => group.author ));

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
      <InkLevel :class="styles.catalogPage__ink" />

      <ion-accordion-group :class="styles.catalogPage__authors" multiple :value="openAuthors">
        <ion-accordion v-for="group in groups" :key="group.author" :value="group.author">
          <ion-item slot="header" :class="styles.catalogPage__header" lines="none">
            <ion-label>
              <span :class="styles.catalogPage__author">{{ group.author }}</span>
              <span :class="styles.catalogPage__progress">{{ getProgress( getAuthorPassages( group )) }}</span>
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
