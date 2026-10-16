import { reactive, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { appVars } from '@/configApp';

type TAppStore = {
  ink: number, // капли в чернильнице, не больше appVars.inkwell.capacity
  tokens: number, // жетоны знания
  restoredPassages: string[], // id абзацев, ушедших в архив
}

const STORAGE_KEY: string = 'appStore';

export const appStore: TAppStore = reactive({
  ink: appVars.inkwell.capacity,
  tokens: 0,
  restoredPassages: [],
});

export const restoreAppStore = async (): Promise< void > => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });

  if ( !value ) {
    return;
  }

  try {
    Object.assign( appStore, JSON.parse( value ));
  } catch {
    // Повреждённые данные игнорируем, стор останется с дефолтами
  }
};

export const addInk = ( drops: number ): void => {
  appStore.ink = Math.min( appStore.ink + drops, appVars.inkwell.capacity );
};

export const spendToken = (): void => {
  if ( appStore.tokens < 1 ) {
    return;
  }

  appStore.tokens -= 1;
  appStore.ink = appVars.inkwell.capacity;
};

// Автосохранение при любом изменении стора
watch( appStore, () => {
  Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify( appStore ),
  });
});
