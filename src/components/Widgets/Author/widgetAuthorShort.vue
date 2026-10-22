<script setup lang="ts">
import { computed, ref } from 'vue';
import styles from './widgetAuthorShort.module.scss';
import {getInitials} from '@/composables/getInitials';
import { getAuthorById } from '@/api/getAuthorById';
import { getAuthorImage } from '@/composables/getAuthorImage';
import type { TAuthor } from '@/api/getAuthors';

const props = defineProps<{
  authorId: string,
  comment: string,
}>();

const author = ref< TAuthor | null >( null );

getAuthorById( props.authorId ).then( ( found: TAuthor | null ) => {
  author.value = found;
});

const avatarUrl = computed( (): string | undefined => author.value ? getAuthorImage( author.value.avatar ) : undefined );
</script>

<template>
  <div :class="styles.widgetAuthorShort">
    <div :class="styles.widgetAuthorShort__avatar">
      <img v-if="avatarUrl"
           :class="styles.widgetAuthorShort__avatarImage"
           :src="avatarUrl"
           alt=""
      />
      <template v-else>
        {{ author?.short && getInitials( author?.short ) }}
      </template>
    </div>

    <div :class="styles.widgetAuthorShort__content">
      <div :class="styles.widgetAuthorShort__title">
        {{ author?.short }}
      </div>

      <div v-if="props.comment"
           :class="styles.widgetAuthorShort__comment"
      >
        {{ props.comment }}
      </div>
    </div>
  </div>
</template>