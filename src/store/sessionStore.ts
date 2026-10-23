import { reactive } from 'vue';

// Состояние сессии: в отличие от appStore не сохраняется
type TSessionStore = {
  isWide: boolean, // планшетная раскладка, от 992px
}

const wideQuery: MediaQueryList = window.matchMedia( '(min-width: 992px)' );

export const sessionStore: TSessionStore = reactive({
  isWide: wideQuery.matches,
});

wideQuery.addEventListener( 'change', ( event: MediaQueryListEvent ) => {
  sessionStore.isWide = event.matches;
});
