<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import { getRules, type TRule } from '@/api/getRules';

type TRuleSection = {
  title: string,
  rules: TRule[],
};

const rules = ref< TRule[] >( [] );

getRules().then( ( result: TRule[] ) => {
  rules.value = result;
});

// Разделы в порядке первого появления в rules.json
const sections = computed( (): TRuleSection[] => {
  const result: TRuleSection[] = [];

  for ( const rule of rules.value ) {
    const section: TRuleSection | undefined = result.find( ( item: TRuleSection ) => item.title === rule.section );

    if ( section ) {
      section.rules.push( rule );
    } else {
      result.push({ title: rule.section, rules: [ rule ] });
    }
  }

  return result;
});
</script>

<template>
  <ion-page>
    <AppHeader page-name="Правила" />

    <ion-content :fullscreen="true" class="ion-padding">
      <section v-for="section in sections" :key="section.title">
        <h2 :class="listCard.listCard__heading">{{ section.title }}</h2>

        <ul :class="listCard.listCard">
          <li v-for="rule in section.rules" :key="rule.id">
            <router-link :class="listCard.listCard__item" :to="`/rules/${ rule.id }`">
              <span :class="listCard.listCard__title">{{ rule.title }}</span>
              <span :class="listCard.listCard__meta">{{ rule.hint }}</span>
            </router-link>
          </li>
        </ul>
      </section>
    </ion-content>
  </ion-page>
</template>
