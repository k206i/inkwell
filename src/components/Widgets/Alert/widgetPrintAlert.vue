<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { refreshOutline, waterOutline } from 'ionicons/icons';
import styles from './widgetPrintAlert.module.scss';

const props = defineProps<{
  text: string,
  warning?: boolean,
}>();
</script>

<template>
  <div :class="[
          styles.widgetPrintAlert,
            props.warning && styles.widgetPrintAlert_warning
          ]"
       role="status"
  >
    <span :class="styles.widgetPrintAlert__icon" aria-hidden="true">
      <ion-icon :icon="props.warning ? waterOutline : refreshOutline" />
    </span>

    <span :class="styles.widgetPrintAlert__text">{{ props.text }}</span>

    <router-link v-if="props.warning" :class="styles.widgetPrintAlert__link" to="/machine">К автомату ›</router-link>
  </div>
</template>
