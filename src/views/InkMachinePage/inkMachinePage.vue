<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import styles from './inkMachinePage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import actionButton from '@/assets/styles/actionButton.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import { getRules, type TRule } from '@/api/getRules';
import { declineUnit } from '@/composables/declineUnit';
import { getWeakRules, type TWeakRule } from '@/composables/getWeakRules';
import { appStore, spendToken } from '@/store/appStore';
import { appVars } from '@/configApp';

type TWeakCard = {
  rule: TRule,
  errors: number,
  attempts: number,
};

const rules = ref< TRule[] >( [] );

getRules().then( ( result: TRule[] ) => {
  rules.value = result;
});

const isTokenDisabled = computed( (): boolean => appStore.tokens < 1 || appStore.ink >= appVars.inkwell.capacity );
const drops: number = appVars.machine.dropsPerAnswer;
const weakDrops: number = appVars.machine.dropsPerWeakAnswer;

const weakCards = computed( (): TWeakCard[] => getWeakRules( appStore.ruleHistory, appVars.adaptive.weakLimit )
  .flatMap( ( weak: TWeakRule ): TWeakCard[] => {
    const rule: TRule | undefined = rules.value.find( ( item: TRule ) => item.id === weak.ruleId );

    return rule ? [ { rule, errors: weak.errors, attempts: weak.attempts } ] : [];
  }));
</script>

<template>
  <ion-page>
    <AppHeader page-name="Автомат чернил" />

    <ion-content :fullscreen="true" class="ion-padding">
      <div :class="styles.inkMachinePage__top">
        <InkLevel />

        <button
            :class="actionButton.actionButton"
            :disabled="isTokenDisabled"
            type="button"
            @click="spendToken"
        >
          Опустить жетон
        </button>

        <p :class="styles.inkMachinePage__note">
          Жетон наполняет чернильницу доверху. Без жетона: {{ drops }} {{ declineUnit( drops, 'drop' ) }} за верный ответ,
          по слабым правилам {{ weakDrops }}.
        </p>
      </div>

      <template v-if="weakCards.length">
        <h2 :class="listCard.listCard__heading">Повторить</h2>

        <ul :class="listCard.listCard">
          <li v-for="card in weakCards" :key="card.rule.id">
            <router-link :class="listCard.listCard__item" :to="`/machine/${ card.rule.id }`">
              <span :class="listCard.listCard__title">{{ card.rule.title }}</span>
              <span :class="listCard.listCard__meta">
                {{ card.errors }} {{ declineUnit( card.errors, 'error' ) }} из последних {{ card.attempts }}
                · {{ weakDrops }} {{ declineUnit( weakDrops, 'drop' ) }} за ответ
              </span>
            </router-link>
          </li>
        </ul>
      </template>

      <h2 :class="listCard.listCard__heading">Задания</h2>

      <ul :class="listCard.listCard">
        <li v-for="rule in rules" :key="rule.id">
          <router-link :class="listCard.listCard__item" :to="`/machine/${ rule.id }`">
            <span :class="listCard.listCard__title">{{ rule.title }}</span>
            <span :class="listCard.listCard__meta">
              {{ rule.section }} · {{ rule.questions.length }} {{ declineUnit( rule.questions.length, 'question' ) }}
            </span>
          </router-link>
        </li>
      </ul>
    </ion-content>
  </ion-page>
</template>
