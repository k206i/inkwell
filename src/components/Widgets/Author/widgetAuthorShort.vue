<script setup lang="ts">
import styles from './widgetAuthorShort.module.scss';

const props = defineProps<{
  authorId: string,
  comment: string,
}>();
</script>

<template>
  <div :class="styles.widgetAuthorShort">
    <div :class="styles.widgetAuthorShort__userpic">
      Т
    </div>

    <div :class="styles.widgetAuthorShort__content">
      <div :class="styles.widgetAuthorShort__title">
        Л. Н. Толстой
        {{ props.authorId }}
      </div>

      <div v-if="props.comment"
           :class="styles.widgetAuthorShort__comment"
      >
        {{ props.comment }}
      </div>
    </div>
  </div>
</template>