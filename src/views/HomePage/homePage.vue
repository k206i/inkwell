<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, ref } from 'vue';
import styles from './homePage.module.scss';
import listCard from '@/assets/styles/listCard.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import AppFooter from '@/components/AppFooter/appFooter.vue';
import SaelianMascot from '@/components/SaelianMascot/saelianMascot.vue';
import InkLevel from '@/components/InkLevel/inkLevel.vue';
import { getPassages, type TPassage } from '@/api/getPassages';
import { getRules, type TRule } from '@/api/getRules';
import { getWeakRules } from '@/composables/getWeakRules';
import { appStore } from '@/store/appStore';

type THubLink = {
  to: string,
  title: string,
  meta: string,
};

const appVersion: string = __APP_VERSION__;

const links: THubLink[] = [
  { to: '/catalog', title: 'Реставрация', meta: 'Выбрать абзац для восстановления' },
  { to: '/archive', title: 'Архив', meta: 'Восстановленные абзацы' },
  { to: '/machine', title: 'Автомат чернил', meta: 'Наполнить чернильницу' },
  { to: '/achievements', title: 'Достижения', meta: 'Скоро' },
  { to: '/rules', title: 'Правила', meta: 'Справочник архивариуса' },
];

const passages = ref< TPassage[] >( [] );
const rules = ref< TRule[] >( [] );

getPassages().then( ( result: TPassage[] ) => {
  passages.value = result;
});

getRules().then( ( result: TRule[] ) => {
  rules.value = result;
});

const accuracy = computed( (): number | null => {
  const total: number = appStore.answers.right + appStore.answers.wrong;

  return total ? Math.round( appStore.answers.right / total * 100 ) : null;
});

const weakestRule = computed( (): TRule | null => {
  const [ weakest ] = getWeakRules( appStore.ruleHistory, 1 );

  return weakest ? rules.value.find( ( rule: TRule ) => rule.id === weakest.ruleId ) ?? null : null;
});
</script>

<template>
  <ion-page>
    <AppHeader is-home-page />

    <ion-content :fullscreen="true" class="ion-padding">
      <div :class="styles.homePage">
        <SaelianMascot :class="styles.homePage__mascot" autoplay emotion="smile" />

        <InkLevel />

        <section :class="styles.homePage__stats">
          <p :class="styles.homePage__stat">
            Восстановлено абзацев: {{ appStore.restoredPassages.length }} из {{ passages.length }}
          </p>

          <p :class="styles.homePage__stat">
            Точность: {{ accuracy === null ? 'пока нет ответов' : `${ accuracy }%` }}
          </p>

          <p :class="styles.homePage__stat">
            Чаще всего ошибки:
            <router-link v-if="weakestRule" :to="`/machine/${ weakestRule.id }`">{{ weakestRule.title }}</router-link>
            <template v-else>пока нет</template>
          </p>
        </section>

        <nav :class="[ listCard.listCard, styles.homePage__links ]">
          <router-link
              v-for="link in links"
              :key="link.to"
              :class="listCard.listCard__item"
              :to="link.to"
          >
            <span :class="listCard.listCard__title">{{ link.title }}</span>
            <span :class="listCard.listCard__meta">{{ link.meta }}</span>
          </router-link>
        </nav>

        <p :class="styles.homePage__version">v{{ appVersion }}</p>

        <router-link to="/visor" :class="styles.homePage__visorLink">
          Эмоции визора
        </router-link>
      </div>
    </ion-content>

    <AppFooter />
  </ion-page>
</template>
