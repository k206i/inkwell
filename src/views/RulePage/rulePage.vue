<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import styles from './rulePage.module.scss';
import AppHeader from '@/components/AppHeader/appHeader.vue';
import { getRuleById } from '@/api/getRuleById';
import type { TRule } from '@/api/getRules';

const route = useRoute();
const rule = ref< TRule | null >( null );
const isLoaded = ref< boolean >( false );

getRuleById( String( route.params.id )).then( ( found: TRule | null ) => {
  rule.value = found;
  isLoaded.value = true;
});

// Выделенный фрагмент примера обёрнут в *звёздочки*: нечётные куски после разбиения выделяются
const splitEmphasis = ( text: string ): string[] => text.split( '*' );
</script>

<template>
  <ion-page>
    <AppHeader :page-name="rule ? rule.title : 'Правило'" />

    <ion-content :fullscreen="true" class="ion-padding">
      <p v-if="isLoaded && !rule">Правило не найдено.</p>

      <article v-if="rule" :class="styles.rulePage">
        <p :class="styles.rulePage__section">{{ rule.section }}</p>

        <p v-for="( paragraph, index ) in rule.text" :key="index">{{ paragraph }}</p>

        <template v-if="rule.exceptions.length">
          <h3 :class="styles.rulePage__heading">Исключения</h3>
          <p>{{ rule.exceptions.join( ', ' ) }}</p>
        </template>

        <template v-if="rule.examples.length">
          <h3 :class="styles.rulePage__heading">Примеры из классики</h3>

          <figure v-for="( example, index ) in rule.examples" :key="index" :class="styles.rulePage__example">
            <blockquote :class="styles.rulePage__quote">
              <template v-for="( piece, pieceIndex ) in splitEmphasis( example.text )" :key="pieceIndex">
                <mark v-if="pieceIndex % 2" :class="styles.rulePage__mark">{{ piece }}</mark>
                <template v-else>{{ piece }}</template>
              </template>
            </blockquote>

            <figcaption :class="styles.rulePage__source">{{ example.source }}</figcaption>
          </figure>
        </template>

        <router-link :class="styles.rulePage__practice" :to="`/machine/${ rule.id }`">
          Потренироваться у автомата
        </router-link>
      </article>
    </ion-content>
  </ion-page>
</template>
