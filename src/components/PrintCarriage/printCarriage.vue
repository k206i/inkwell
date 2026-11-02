<script setup lang="ts">
import { computed, ref } from 'vue';
import styles from './printCarriage.module.scss';

const props = defineProps<{
  step: number,
}>();

const LIFT_DURATION: number = 250;
const STRIKE_DURATION: number = 180;
const STRIKE_PAUSE: number = 200;
const SHAKE_DURATION: number = 560;
const RING_DURATION: number = 300;

const STRIKE_FRAMES: Keyframe[] = [ { offset: .4, transform: 'translateY( 3px )' } ];

const SHAKE_FRAMES: Keyframe[] = [
  { offset: .12, transform: 'translate( 0, 3px )' },
  { offset: .24, transform: 'translate( 0, 0 )' },
  { offset: .34, transform: 'translateX( -9px )' },
  { offset: .45, transform: 'translateX( 8px )' },
  { offset: .56, transform: 'translateX( -6px )' },
  { offset: .67, transform: 'translateX( 5px )' },
  { offset: .78, transform: 'translateX( -3px )' },
  { offset: .89, transform: 'translateX( 2px )' },
  { offset: 1, transform: 'translateX( 0 )' },
];

const RING_FRAMES: Keyframe[] = [
  { transform: 'scale( .6 )', opacity: .9 },
  { transform: 'scale( 1.15 )', opacity: 0 },
];

type TPoint = { x: number, y: number };

const head = ref< HTMLImageElement | null >( null );
const ring = ref< HTMLElement | null >( null );
const target = ref< TPoint | null >( null );
const isRaised = ref< boolean >( false );

const rootStyle = computed( (): Record< string, string > => ({
  '--step': `${ props.step }ms`,
  '--lift': `${ LIFT_DURATION }ms`,
  ...( target.value ? { '--x': `${ target.value.x }px`, '--y': `${ target.value.y }px` } : {} ),
}));

const wait = ( ms: number ): Promise< void > => new Promise( ( resolve ) => window.setTimeout( resolve, ms ));

const moveTo = async ( x: number, y: number ): Promise< void > => {
  if ( !target.value ) {
    isRaised.value = true;
    await wait( LIFT_DURATION );
  }

  target.value = { x, y };
  isRaised.value = false;

  await wait( props.step );
};

const strike = async ( isWrong: boolean ): Promise< void > => {
  head.value?.animate( isWrong ? SHAKE_FRAMES : STRIKE_FRAMES, { duration: isWrong ? SHAKE_DURATION : STRIKE_DURATION, easing: 'ease-out' });
  ring.value?.animate( RING_FRAMES, { duration: RING_DURATION, easing: 'ease-out' });

  await wait( isWrong ? SHAKE_DURATION : STRIKE_PAUSE );
};

const park = async (): Promise< void > => {
  target.value = null;
  isRaised.value = true;
  await wait( props.step );

  isRaised.value = false;
  await wait( LIFT_DURATION );
};

defineExpose({ moveTo, strike, park });
</script>

<template>
  <div :class="styles.printCarriage" :style="rootStyle" aria-hidden="true">
    <span :class="[ styles.printCarriage__rail, styles.printCarriage__rail_left ]" />
    <span :class="[ styles.printCarriage__rail, styles.printCarriage__rail_right ]" />
    <span :class="[ styles.printCarriage__ticks, styles.printCarriage__ticks_left ]" />
    <span :class="[ styles.printCarriage__ticks, styles.printCarriage__ticks_right ]" />

    <span :class="styles.printCarriage__bar">
      <span :class="[ styles.printCarriage__slider, styles.printCarriage__slider_left ]" />
      <span :class="[ styles.printCarriage__slider, styles.printCarriage__slider_right ]" />
    </span>

    <span ref="ring" :class="styles.printCarriage__ring" />

    <img
        ref="head"
        :class="[ styles.printCarriage__head, { [styles.printCarriage__head_raised]: isRaised } ]"
        src="@/assets/img/environment/carriage-head.svg?url"
        alt=""
    />

    <img :class="styles.printCarriage__inkwell" src="@/assets/img/environment/carriage-inkwell.svg?url" alt="" />
  </div>
</template>
