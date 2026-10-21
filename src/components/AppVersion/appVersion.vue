<script setup lang="ts">
import styles from './appVersion.module.scss';
import { appStore } from '@/store/appStore';
import { appVars } from '@/configApp';

const appVersion: string = __APP_VERSION__;

// Возвращает игрока к состоянию первой установки: пустой архив, без жетонов, полная чернильница
const onResetPassages = () => {
  appStore.restoredPassages = [];
  appStore.tokens = 0;
  appStore.ink = appVars.inkwell.capacity;
};

const onResetStatistics = () => {
  appStore.ruleHistory = {};
  appStore.answers = { right: 0, wrong: 0 };
};
</script>

<template>
  <div :class="styles.appVersion">
    <p :class="styles.appVersion__version">v{{ appVersion }}</p>

    <div :class="styles.appVersion__debug">
      <p :class="styles.appVersion__heading">Отладка</p>

      <button :class="styles.appVersion__button" type="button" @click="onResetPassages">
        Сбросить абзацы, жетоны и чернила ({{ appStore.restoredPassages.length }})
      </button>

      <button :class="styles.appVersion__button" type="button" @click="onResetStatistics">
        Сбросить статистику
      </button>

      <router-link to="/visor" :class="styles.homePage__visorLink">
        Эмоции визора
      </router-link>
    </div>
  </div>
</template>
