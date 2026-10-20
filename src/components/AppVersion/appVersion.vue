<script setup lang="ts">
import styles from './appVersion.module.scss';
import { appStore } from '@/store/appStore';

const appVersion: string = __APP_VERSION__;

const onResetPassages = () => {
  appStore.restoredPassages = [];
  appStore.tokens = 0;
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
        Сбросить восстановленные абзацы ({{ appStore.restoredPassages.length }})
      </button>

      <button :class="styles.appVersion__button" type="button" @click="onResetStatistics">
        Сбросить статистику
      </button>
    </div>
  </div>
</template>
