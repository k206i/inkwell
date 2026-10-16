<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { ticket, water } from 'ionicons/icons';
import styles from './inkLevel.module.scss';
import { appStore } from '@/store/appStore';
import { appVars } from '@/configApp';
</script>

<template>
  <div :class="styles.inkLevel">
    <span :class="styles.inkLevel__item" aria-label="Чернила">
      <ion-icon :class="styles.inkLevel__ink" :icon="water" />
      {{ appStore.ink }} / {{ appVars.inkwell.capacity }}
    </span>

    <span :class="styles.inkLevel__item" aria-label="Жетоны знания">
      <ion-icon :class="styles.inkLevel__token" :icon="ticket" />
      {{ appStore.tokens }}
    </span>
  </div>
</template>
